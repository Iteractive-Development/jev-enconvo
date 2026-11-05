import { EnconvoResponse, type RequestOptions } from "@enconvo/api";
import { runWorkflow, outputString } from "./lib/jev";

// Tool routes verified live against this install's Local API (2026-11-02):
//   POST /api/apple_mail/list_messages      -> 200 (installed apple_mail plugin command)
//   POST /api/apple_messages/get_unread_messages -> 200 (installed apple_messages plugin command)
// Both are first-party Enconvo plugins whose commands answer at /api/<plugin>/<command>.
// Workflow DSL fields used below are documented in the installed workflow skill
// (agent-workflow/v1): `uses: transform` + `value:` (Transform executor, pure
// template evaluation) and `required: false` (reliability knob: a step failure
// doesn't abort the run). Verified against workflow skill v1.0.133.
const SOURCE = `version: agent-workflow/v1
title: Triage Inbox
description: Sort recent Mail inbox messages and unread iMessages into triage lanes.
inputs:
  mail_limit:
    type: number
    default: 15
  messages_limit:
    type: number
    default: 10
jobs:
  triage:
    steps:
      - id: fetch_mail
        tool: apple_mail/list_messages
        with: { mailbox: INBOX, limit: "{{ inputs.mail_limit }}" }
      - id: fetch_messages
        tool: apple_messages/get_unread_messages
        with: { limit: "{{ inputs.messages_limit }}" }
      - id: mail_lanes
        foreach: "{{ steps.fetch_mail.output.result or [] }}"
        uses: classify
        question: "Which triage lane does this email belong in?"
        options:
          Act now: "needs a reply, decision or action from the user today"
          Read later: "worth reading, no response expected"
          Archive: "notifications, receipts, ads and promotions, even when they urge quick action"
          Follow up: "waiting on someone else; remind if silent"
        input: "Email from {{ item.senderName or item.senderAddress or 'unknown sender' }} — subject: {{ item.subject or '(no subject)' }}"
        required: false
      - id: message_lanes
        foreach: "{{ steps.fetch_messages.output.result or [] }}"
        uses: classify
        question: "Which triage lane does this message belong in?"
        options:
          Act now: "needs a reply, decision or action from the user today"
          Read later: "worth reading, no response expected"
          Archive: "notifications, receipts, ads and promotions, even when they urge quick action"
          Follow up: "waiting on someone else; remind if silent"
        input: "Message from {{ item.sender or 'unknown sender' }}: {{ item.content or '' }}"
        required: false
      - id: summary
        uses: transform
        value: "Mail triaged: {{ steps.mail_lanes.output | length }}. Messages triaged: {{ steps.message_lanes.output | length }}."
      - id: lanes
        uses: transform
        value: "{{ [steps.mail_lanes.output, steps.message_lanes.output] | dump }}"
`;

/** Triage recent Mail and unread iMessages into lanes. */
export default async function main(request: Request) {
  const options = (await request.json()) as RequestOptions & { mail_limit?: number; messages_limit?: number };
  try {
    const inputs: Record<string, unknown> = {};
    if (typeof options.mail_limit === "number" && options.mail_limit > 0) inputs.mail_limit = options.mail_limit;
    if (typeof options.messages_limit === "number" && options.messages_limit > 0) inputs.messages_limit = options.messages_limit;
    const outputs = await runWorkflow(SOURCE, inputs);
    const lanes = outputs["triage.lanes"] as unknown | undefined;
    let summary = outputString(outputs, "triage.summary");
    if (Array.isArray(lanes) && lanes.length === 2 && Array.isArray(lanes[0])) {
      const [mailLanes, msgLanes] = lanes as Array<Array<{ label?: string }>>;
      const count = (arr: Array<{ label?: string }>) =>
        arr.reduce<Record<string, number>>((m, x) => ({ ...m, [String(x.label ?? "?")]: (m[String(x.label ?? "?")] ?? 0) + 1 }), {});
      const fmt = (m: Record<string, number>) => Object.entries(m).map(([k, v]) => `${k}: ${v}`).join(", ") || "none";
      summary = [
        outputString(outputs, "triage.summary"),
        `Email lanes — ${fmt(count(mailLanes))}`,
        `Message lanes — ${fmt(count(msgLanes))}`
      ].join("\n");
    }
    return EnconvoResponse.text(summary);
  } catch (error) {
    return EnconvoResponse.text(`Triage Inbox failed: ${(error as Error).message}`);
  }
}
