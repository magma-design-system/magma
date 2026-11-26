# magma-figma-component

A Claude Code skill that adds or realigns Magma components (`mds-*`) in the **Magma Design System 2** Figma library so they match the code: same props and values, every value bound to a token, checked on the library's 🧪 QA page.

## Setup

In this repository there is nothing to install: Claude Code loads it with the maintainers' plugin `magma-dev` (`.claude/skills/magma-dev/`), as `/magma-dev:magma-figma-component`, and the scripts read the Magma code of the checkout they are in. You need:

1. The **Figma plugin for Claude Code**, logged in with an account that can edit the library.
2. Python 3 (nothing to `pip install`).

To use it outside this repository, copy the folder into `~/.claude/skills/` and set `magmaStencil` in `config.json` to `<magma repo>/projects/stencil` (or clone Magma at `~/magma`).

Check the setup any time, from the root of the repository:

```bash
python3 .claude/skills/magma-dev/skills/magma-figma-component/scripts/doctor.py
```

## Use

Just ask Claude, for example:

- "Add mds-price-table-header to the Magma Figma library"
- "Check Stepper Bar Item in Figma against the Magma code"
- "Realign the Input/Number component with the code"

Claude reads the code, shows you the mapping (props, tokens, layout), builds the component after your OK, then runs the QA until there are 0 KO. **It never publishes the library and never edits the Magma code**: you publish.

## What the QA checks

- Prop names, values and defaults are the ones in `magma.api.txt`.
- Every fill, stroke, gap, padding, radius, text and effect is bound to a library token (no arbitrary values).
- Text does not overflow the component; descriptions follow the template; missing variant combinations are documented.

The QA runs when Claude (or you) asks for it: it does not block a publish on its own.

## Files

| File                       | What                                                                              |
| -------------------------- | --------------------------------------------------------------------------------- |
| `SKILL.md`                 | The workflow Claude follows                                                       |
| `config.json`              | Figma file key, QA page name, optional Magma path                                 |
| `references/`              | Conventions (props, tokens, layout, descriptions) and known Figma API traps       |
| `scripts/doctor.py`        | Setup check                                                                       |
| `scripts/extract-api.py`   | A component's props from the Magma code                                           |
| `scripts/component-css.py` | A component's CSS state by state, imported sheets included                        |
| `scripts/figma-script.py`  | Generates the Figma scripts (`check`, `card`, `tokens`) from `scripts/templates/` |
