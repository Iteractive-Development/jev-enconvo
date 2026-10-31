import { EnconvoResponse, type RequestOptions } from "@enconvo/api";
import { runWorkflow, outputString } from "./lib/jev";

const SOURCE = `version: agent-workflow/v1
title: Jev Drift Check
description: Re-run the Auto Route classifier probes and flag drift against the 2026-10-29 baselines.
inputs:
  tolerance:
    type: number
    default: 0.15
  probes:
    type: array
    default:
      - text: "Internal memo: the Q4 reorg plan is attached — do not forward outside the company. Summarize the key changes."
        expect: "Confidential documents"
        baseline: 0.99
      - text: "Does this mole look concerning? A photo of a skin lesion is attached."
        expect: "Domain expert"
        baseline: 0.91
      - text: "A screenshot of a crash dialog. What is this error and how do I fix it?"
        expect: "Vision & documents"
        baseline: 0.96
      - text: "A screenshot of a public blog post. Summarize this article."
        expect: "Vision & documents"
        baseline: 0.99
      - text: "Review this internal NDA for risks before I sign it."
        expect: "Confidential documents"
        baseline: 0.89
      - text: "What is our exposure under Ontario law if we proceed with this internal layoff plan?"
        expect: "Domain expert"
        baseline: 0.59
      - text: "A screenshot of a navbar. Fix the CSS so the nav items line up."
        expect: "Hard code"
        baseline: 0.94
      - text: "Classify these 50 customer feedback snippets by sentiment."
        expect: "Bulk"
        baseline: 1.0
jobs:
  drift:
    steps:
      - id: probe
        foreach: "{{ inputs.probes }}"
        uses: classify
        question: "Which Auto Route should take this message?"
        options:
          Hard code: "code fixes and features, including fixes specified by screenshots, mockups or screen recordings"
          Vision & documents: "reading public or unspecified screenshots, photos, scans and other images"
          Domain expert: "expert domain questions, including questions with attached photos, scans or documents"
          Confidential documents: "internal, confidential or sensitive material — memos, NDAs, plans, financials"
          Simple: "short rewrites, replies and quick questions"
          Bulk: "large batch processing of many items"
          X: "research and posts on X"
          Security: "authorized security research and red-team work"
          Fallback: "anything the other routes do not clearly cover"
        input: "{{ item.text }}"
      - id: compare
        run: |
          python3 - <<'PYEOF'
          import json
          results = json.loads(r'''{{ steps.probe.output | dump }}''')
          probes = json.loads(r'''{{ inputs.probes | dump }}''')
          tol = {{ inputs.tolerance }}
          flags = []
          for i, (r, p) in enumerate(zip(results, probes), 1):
              top = r["label"]
              base_now = r["probabilities"].get(p["expect"], 0.0)
              if top != p["expect"]:
                  flags.append({"probe": i, "got": top, "expected": p["expect"], "baseline": p["baseline"], "now": round(base_now, 2), "why": "top label changed"})
              elif p["baseline"] - base_now > tol:
                  flags.append({"probe": i, "got": top, "expected": p["expect"], "baseline": p["baseline"], "now": round(base_now, 2), "why": "expected-route probability dropped more than tolerance"})
          print(json.dumps({"drift": bool(flags), "flags": flags, "probes_run": len(results), "tolerance": tol}, indent=2))
          PYEOF
`;

/** Re-run the Auto Route probes and report calibration drift. */
export default async function main(request: Request) {
  void request;
  try {
    const outputs = await runWorkflow(SOURCE, {});
    const verdict = outputString(outputs, "drift.compare.stdout") || outputString(outputs, "drift.compare");
    return EnconvoResponse.text(verdict);
  } catch (error) {
    return EnconvoResponse.text(`Drift Check failed: ${(error as Error).message}`);
  }
}
