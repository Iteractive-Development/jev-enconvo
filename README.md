# jev-enconvo

Plugin N+1 of the Agent Plugins series — original work, not a repo conversion.

A one-plugin folder marketplace (`jev-enconvo`) carrying the **jev-enconvo**
skill: how to run Jev (TypeSafe's System One judgment model) inside Enconvo —

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

jev-enconvo installs as a built Enconvo extension (three no-view commands
plus the bundled skill), so the install is a build, not a marketplace
install — `plugin install jev-enconvo@jev-enconvo` fails on purpose because
the plugin source has to be built:

    cd ~/Documents/Agent\ Plugins/jev-enconvo/marketplace/plugins/jev-enconvo
    npm install --include=dev   # npm omits dev deps by default on this Mac; the build needs tsup
    npm run build

`enconvo plugin build` installs the result in the running Enconvo. The
folder marketplace registration is provenance only.

## Update

Edit the source in place — the skill at
`marketplace/plugins/jev-enconvo/skills/jev-enconvo/SKILL.md`, commands in
`src/` — then rerun `npm run build` from the plugin folder (add the
`npm install --include=dev` line only when dependencies changed). Raise
`version` in both package.json and .claude-plugin/plugin.json together when
the content meaningfully changes.

## Layout

    jev-enconvo/
├── build-config.json   # provenance: original, hand-maintained (no builder)
├── README.md
└── marketplace/
        ├── .claude-plugin/marketplace.json
        └── plugins/jev-enconvo/
                ├── .claude-plugin/plugin.json
                ├── icon.png
                └── skills/jev-enconvo/SKILL.md
