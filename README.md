## Privacy

Triage Inbox reads recent Mail and unread iMessage content (senders, subjects,
bodies) and sends it to the Jev judgment model on Enconvo Cloud for lane
classification — that is the plugin's design. Nothing is sent anywhere else.

# jev-enconvo

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

