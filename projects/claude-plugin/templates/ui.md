---
name: ui
description: How to write interface code in a project that uses the Magma design system (mds-* web components, the MdsX wrappers of React and Angular, the Magma Tailwind classes and roles). Find the component, read its API and how the framework writes it, paint with roles, check icon slugs and the markup before saving. Use whenever building or changing UI in a Magma project.
license: MIT
compatibility: A project with @maggioli-design-system/magma installed. Uses the magma MCP server of this plugin; without it, the guides installed with the package.
metadata:
  source: https://github.com/magma-design-system/magma/tree/main/projects/claude-plugin
---

# Write UI with Magma

Magma answers from the version installed in this project: ask it instead of guessing. Arguments given with the command, if any: {{arguments}}.

## The procedure

1. **The component.** `find_component` with the need in words; then `get_component` for its API (props and their values, events, slots, parts) and `get_usage` for how the project's framework writes it. Never invent a prop, a value or an event name.
2. **Colour, spacing, classes.** Paint with roles, never with Tailwind's palette or a raw palette step: `list_tokens` finds the role for a need, `suggest_role` the role for a colour you were given. Magma spacing steps are hundredths of a rem (`p-400` is 16px, `p-4` is 0.16px): `explain_class` on any class you are not sure of.
3. **Icons.** `find_icon` for a slug that exists in the sets the project serves; check every slug before writing it in `icon="..."`.
4. **Before saving.** `check_markup` on the template or the stylesheet you wrote; fix what it reports.
5. **After writing.** Run the project's lint (ESLint and Stylelint with the Magma presets).

When a rule is not clear, read the section you need with `get_guide` (conventions, color, typography, theming).

When the tools do not give you what the task needs (you would read Magma's files by hand or guess, or an answer carries `gap`), tell the user, and at the end of the task propose an issue on Magma, one per missing capability: `get_guide` reporting, section "A tool or an answer the MCP server is missing". Open it only once the user agrees.

## The tools of the magma server

{{tools}}

## Without the server

Read the guides installed with the package: `node_modules/@maggioli-design-system/magma/AGENTS.md`, its `agents/*.md` (conventions, color, typography, theming, lint) and, for one component, `dist/collection/components/<tag>/AGENTS.md`, which links the files of its examples and mistakes beside it.
