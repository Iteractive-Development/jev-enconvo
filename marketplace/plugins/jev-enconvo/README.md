# Jev for Enconvo (jev-enconvo)

Run **Jev** — TypeSafe's System One judgment model — inside Enconvo. Jev answers one typed question about an input and returns calibrated probabilities; this plugin turns that into shippable tooling: three one-shot commands, a skill that teaches the patterns, and tested workflow recipes. By [Iteractive Development](https://iteractive.dev).

## What's inside

| Piece | What it does |
| --- | --- |
| **Screen Content** command | Judges selected or pasted content for agent-aimed prompt-injection instructions. Reports CLEAN or BLOCKED and never follows what it finds. |
| **Triage Inbox** command | Sorts recent Apple Mail inbox messages and unread iMessages into Act now / Read later / Archive / Follow up lanes. |
| **Jev Drift Check** command | Re-runs the eight Auto Route classifier probes and flags calibration drift against recorded baselines. |
| **jev-enconvo skill** | Eight worked judgment patterns (untrusted-content gate, context compaction, memory relevance, message triage lanes, skill-selection routing, gates before hard-to-undo steps, closed-judgment offloading, calibration drift check), question and options craft, and copy-paste recipes. |

Commands need Enconvo Cloud (Jev runs there — no API key); the skill's guidance works anywhere the workflow engine does.

## Install

Jev is a full Enconvo extension (it ships its own commands), so install it by building from this folder. `enconvo plugin install` is not the route for it.

```sh
cd plugins/jev-enconvo
npm install --include=dev
npm run build
```

The build installs it into Enconvo.

In Claude Code or Codex, the same folder installs as a Claude-format plugin (`.claude-plugin/plugin.json`): skills and metadata load there; commands are the Enconvo-format layer.

## Build notes

- `npm config get omit` returning `dev` strips devDependencies — install with `npm install --include=dev` or the build fails with `tsup is not installed`.
- The build regenerates `skills/schemas.json` (the command/API schema for agent discovery) and syncs the skill's front matter from `package.json`. The `skill_file_ignored` validator note about `schemas.json` is expected for every command-carrying plugin.
- `package.json` and `.claude-plugin/plugin.json` must carry the same plugin name so every app installs one plugin.
- Updating an installed copy: `npm run build` in this folder. A folder marketplace still lists the skill content; the commands come from the build.

## The three levels

1. **Skill guidance** — the agent composes judge/classify steps per task (the default; zero setup).
2. **Materialized workflows** — seven tested `agent-workflow/v1` files for `~/.enconvo/workflows/`: content-gate, message-triage, drift-check, calibration-harness, action-gate, task-router, compact-context. Recipes are in the skill; they run from the SmartBar and take per-run inputs.
3. **Native commands** — the three commands in this package, which post inline judgment-step YAML to the local `workflow/run` route.

## Commands

| Command | Input | Output |
| --- | --- | --- |
| Screen Content | selected or pasted text (falls back from selection to typed input) | `CLEAN — …(p=…)` or `BLOCKED — …(p=…)`; content is reported, never followed |
| Triage Inbox | none (uses your Mail inbox and unread iMessages; defaults 15 + 10) | lane summary with per-item lanes and confidences |
| Jev Drift Check | none (probe set and baselines are in the command; `tolerance` input) | JSON verdict: `drift`, `flags`, `probes_run` |

## License

MIT — see [LICENSE](LICENSE).
