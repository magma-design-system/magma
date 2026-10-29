---
name: review
description: Review code that uses the Magma design system against its rules. Run the Magma lint, check templates and stylesheets with the magma MCP server, compare with the rules of the installed guides, and report each finding with its fix. Use when asked to review, check or audit UI code in a Magma project, or after finishing UI work there.
license: MIT
compatibility: A project with @maggioli-design-system/magma installed. Uses the magma MCP server of this plugin and the project's ESLint and Stylelint.
metadata:
  source: https://github.com/magma-design-system/magma/tree/main/projects/claude-plugin
---

# Review Magma code

What to review, if given with the command: {{arguments}}. Without it, the files changed on this branch against its base (`git diff --name-only`), keeping templates, components and stylesheets.

## 1. The lint

Run the project's ESLint and Stylelint on those files. When the Magma presets are not configured, call `check_markup` of the magma server on each template and stylesheet instead, and note in the report that the lint is missing (`check_setup` says what to add). The rules:

{{rules}}

## 2. What the lint does not see

For each Magma component in the changed code:

- `get_component`: are the events listened to the ones it emits, the slots the ones it has, the parts the documented ones? Is it styled only through its public custom properties (the ones `get_component` lists) and documented parts?
- Its usage files, the right forms and the mistakes to avoid (the paths `get_component` lists under `files`, named by the installed version): does the code follow them?
- Classes and colours: `explain_class` on the doubtful ones, `suggest_role` for a literal colour.
- `get_guide` on conventions (booleans, events, compound components, accessibility) and on the mistakes shared by every component (`get_guide` with no arguments lists the installed guides).

## 3. The report

Group the findings by file, most severe first; for each one: the line, what is wrong, the rule or the guide section, and the fix. Change the code only if the person asks to.
