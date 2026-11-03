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
        value: "Mail triaged: {{ steps.mail_lanes.output | length }}. Messages triaged: {{ steps.message_lanes.output | length }}. Lanes: {{ steps.mail_lanes.output | dump }} | {{ steps.message_lanes.output | dump }}"
`;

/** Triage recent Mail and unread iMessages into lanes. */
export default async function main(request: Request) {
  void request;
  try {
    const outputs = await runWorkflow(SOURCE, {});
    const summary = outputString(outputs, "triage.summary");
    return EnconvoResponse.text(summary);
  } catch (error) {
    return EnconvoResponse.text(`Triage Inbox failed: ${(error as Error).message}`);
  }
}
