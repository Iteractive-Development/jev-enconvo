# jev-enconvo

## Privacy

Every command sends what it judges to the Jev judgment model on Enconvo
Cloud — that is the plugin's design — and each judgment costs Enconvo Cloud
points. Nothing is sent anywhere else.

- **Screen Content** sends the pasted/selected text (via a `judge` workflow
  step on the app's System One gateway).
- **Screen Vision** uploads the image you choose — downscaled to a ≤1568 px
  JPEG (quality 80) before it leaves the machine — to the same gateway for
  pixel judgment by jev-preview. Screenshots, photos of documents and
  anything else you screen goes to Enconvo Cloud.
- **Triage Inbox** sends senders, subjects and bodies of recent Mail and
  unread iMessages for lane classification.
- **Jev Drift Check** sends its probe texts.

The `vision_judge` Local API route (any yes/no statement about an image)
uploads images the same way.

Plugin N+1 of the Agent Plugins series — original work, not a repo conversion.

An Enconvo plugin carrying the **jev-enconvo** skill: how to run Jev (TypeSafe's System One judgment model) inside Enconvo —

- `uses: judge` / `uses: classify` steps in-chat via the workflow engine
  (`workflow/run`, inline YAML) — no browser, no app host;
- the same steps inside `computer-use/run_workflow` (untouched host app) and
  `browser-use/run_workflow` (tab required);
- TypeSafe primitive → Enconvo surface mapping (Choice/Noul/Score/Box);
- the options label→meaning map (with the measured bare-labels vs map seam
  result), threshold and branch patterns, and the probe testing loop;
- points billing, dry-run and retry behavior, and where Jev does *not* belong.

Pairs with the installed `typesafe-ai` skill, which owns question wording and
state craft; this plugin owns only the Enconvo execution surface.

## Commands

- **Screen Content** — judges selected or pasted **text** for agent-aimed
  prompt-injection instructions (BLOCKED/CLEAN, threshold 0.7).
- **Screen Vision** — judges a selected, attached or path-named **image** the
  same way with jev-preview vision (BLOCKED/UNSURE/CLEAN; the image is
  downsized and uploaded to Enconvo Cloud).
- **Triage Inbox** — sorts recent Mail and unread iMessages into Act now /
  Read later / Archive / Follow up lanes.
- **Jev Drift Check** — re-runs the Auto Route classifier probes and flags
  calibration drift.
- **`vision_judge` route** — Local API POST `jev-enconvo/vision_judge`
  `{image, statement, context_label?, threshold?}` → `{yes, probability,
  band, model}`: a generic pixel judgment for other plugins and workflows.

## Install

This repository is the flat Enconvo plugin itself (package.json with commands,
src/, skills/, assets/). Build and install it from the clone root:

    npm install --include=dev   # npm omits dev deps by default on this Mac; the build needs tsup
    npm run build               # enconvo plugin build — installs into the running Enconvo

Or install straight from GitHub: `enconvo plugin install Iteractive-Development/jev-enconvo`.

## Update

Edit the source in place — commands in `src/`, the bundled skill at
`skills/jev-enconvo/SKILL.md` — then rerun `npm run build` from the repo root
(add `npm install --include=dev` only when dependencies changed). Raise
`version` in `package.json` for every update.

