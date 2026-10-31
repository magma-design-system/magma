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

1. **The flow.** When the UI tells the person something or makes them wait or decide (a message, a confirmation, an empty, a loading or a failed part), `get_pattern` with the need in words, then with the pattern and the values of its variables you know: it returns the case to follow, the same in every product, with the rules of the design language it relies on (`rules`), and the pattern's "Always true" rules. Tell the user when no pattern covers the task, or only a candidate, and which choice you made instead. An open choice the product wants fixed for good goes in its layer, not in the code: `/magma:pattern-layer`.
2. **The component.** `find_component` with the need in words; then `get_component` for its API (props and their values, events, slots, parts) and the rules of the design language that govern it (`rules`: what it draws by itself, such as the inset of `mds-banner`, you do not add again), and `get_usage` for how the project's framework writes it. Never invent a prop, a value or an event name.
3. **The composition.** How the parts stand together (the space between two elements, and the other rules of the design language) is decided by the domains of Foundation, which `get_pattern` lists first (kind `foundation`): read the one you need with `get_guide` by its id (`rhythm`: the space between two elements is the step of their relation, never one picked by eye), and follow the `rules` the answers above give. A section of a page that Magma ships as a building block (kind `block`, such as `page-header`, the head of a page) is laid out from `get_pattern` with its id and the values of its variables: the regions it returns, in that order.
4. **Colour, spacing, classes.** Paint with roles, never with Tailwind's palette or a raw palette step: `list_tokens` finds the role for a need, `suggest_role` the role for a colour you were given. Magma spacing steps are hundredths of a rem (`p-400` is 16px, `p-4` is 0.16px): `explain_class` on any class you are not sure of.
5. **Icons.** `find_icon` for a slug that exists in the sets the project serves; check every slug before writing it in `icon="..."`.
6. **Before saving.** `check_markup` on the template or the stylesheet you wrote; fix what it reports.
7. **After writing.** Run the project's lint (ESLint and Stylelint with the Magma presets).

When the person has to decide on an interface (a layout, where a message goes, which of two components), show it, never words alone: `render_preview` each option with the real components and texts, read its report and fix the markup until it is representative, then send the person the image files, which Claude Code does not show them by itself. Ask with each image, a name and one line, the recommended option first; let them flag an image, and keep an empty field for an answer of their own: render what you understood of it and act only once they confirm. The procedure: `get_guide` mcp, section "Show the person what you mean".

When a rule is not clear, read the section you need with `get_guide` (conventions, color, typography, theming, or a domain of Foundation such as rhythm).

When the tools do not give you what the task needs (you would read Magma's files by hand or guess, or an answer carries `gap`), tell the user, and at the end of the task propose an issue on Magma, one per missing capability: `get_guide` reporting, section "A tool or an answer the MCP server is missing". Open it only once the user agrees.

## The tools of the magma server

{{tools}}

## Without the server

Read the guides installed with the package: `node_modules/@maggioli-design-system/magma/AGENTS.md`, its `agents/*.md` (conventions, color, typography, theming, lint), the domains of Foundation in its `agents/patterns/` (the files of `kind: foundation`, such as `rhythm.md`) and, for one component, `dist/collection/components/<tag>/AGENTS.md`, which links the files of its examples and mistakes beside it.
