---
name: ui
description: How to write interface code in a project that uses the Magma design system (mds-* web components, the MdsX wrappers of React and Angular, the Magma Tailwind classes and roles). Find the component, read its API and how the framework writes it, paint with roles, check icon slugs and the markup before saving. Use whenever building or changing UI in a Magma project.
license: MIT
compatibility: A project with @maggioli-design-system/magma installed. Uses the magma MCP server of this plugin; without it, the guides installed with the package.
metadata:
  source: https://github.com/magma-design-system/magma/tree/main/projects/claude-plugin
---

<!-- Generated from projects/claude-plugin/templates/ui.md by scripts/skills.ts: edit the template. -->

# Write UI with Magma

Magma answers from the version installed in this project: ask it instead of guessing. Arguments given with the command, if any: $ARGUMENTS.

## The procedure

1. **The flow.** When the UI tells the person something or makes them wait or decide (a message, a confirmation, an empty, a loading or a failed part), `get_pattern` with the need in words, then with the pattern and the values of its variables you know: it returns the case to follow, the same in every product, and its "Always true" rules. Tell the user when no pattern covers the task, or only a candidate, and which choice you made instead. An open choice the product wants fixed for good goes in its layer, not in the code: `/magma:pattern-layer`.
2. **The component.** `find_component` with the need in words; then `get_component` for its API (props and their values, events, slots, parts) and `get_usage` for how the project's framework writes it. Never invent a prop, a value or an event name.
3. **Colour, spacing, classes.** Paint with roles, never with Tailwind's palette or a raw palette step: `list_tokens` finds the role for a need, `suggest_role` the role for a colour you were given. Magma spacing steps are hundredths of a rem (`p-400` is 16px, `p-4` is 0.16px): `explain_class` on any class you are not sure of.
4. **Icons.** `find_icon` for a slug that exists in the sets the project serves; check every slug before writing it in `icon="..."`.
5. **Before saving.** `check_markup` on the template or the stylesheet you wrote; fix what it reports.
6. **After writing.** Run the project's lint (ESLint and Stylelint with the Magma presets).

When the person has to decide on an interface (a layout, where a message goes, which of two components), show it, never words alone: `render_preview` each option with the real components and texts, read its report and fix the markup until it is representative, then send the person the image files, which Claude Code does not show them by itself. Ask with each image, a name and one line, the recommended option first; let them flag an image, and keep an empty field for an answer of their own: render what you understood of it and act only once they confirm. The procedure: `get_guide` mcp, section "Show the person what you mean".

When a rule is not clear, read the section you need with `get_guide` (conventions, color, typography, theming).

When the tools do not give you what the task needs (you would read Magma's files by hand or guess, or an answer carries `gap`), tell the user, and at the end of the task propose an issue on Magma, one per missing capability: `get_guide` reporting, section "A tool or an answer the MCP server is missing". Open it only once the user agrees.

## The tools of the magma server

| Tool | What it answers |
| --- | --- |
| `find_component` | Find the Magma components that fit a need, described in words ("a date range picker", "a dismissible notice"). |
| `get_component` | The API of one Magma component in the installed version: props with their type, allowed values and default, events with their detail, methods, slots, parts and public CSS custom properties (the only ones a product sets; the internal ones are counted, they may change in any release), and the files of its usage guide (examples, mistakes). |
| `get_usage` | How to write one Magma component in a framework: the import, the element or wrapper name, every prop and event as that framework writes them (attribute, React prop and onMdsX handler, Angular [input] and (output)), an example and the traps of that framework. |
| `list_tokens` | The Magma roles and tokens of the installed version, each with what it is for, its CSS custom property, its light value and the Tailwind class that reads it. |
| `suggest_role` | The semantic role to use instead of a raw colour: a literal (#f5f5f5, rgb(...), oklch(...)), a Tailwind class (bg-gray-100, text-tone-neutral-03, shadow-gray-900/20) or a palette step (--tone-neutral-09). |
| `explain_class` | What a Tailwind class does with the Magma theme: the token it reads and its value, the Magma utility it is, or the trap it falls in (p-4 is 0.01rem in Magma, not 16px; bg-white ignores the theme). |
| `find_icon` | Icon slugs that exist in the sets the project installed (mi/<variant>/<name> from @material-icons/svg, mdi/<name> from @mdi/svg, mgg/<name> from svg-icons). |
| `get_guide` | The guides Magma ships for agents (installation, conventions, color, typography, theming, lint...): without arguments the list with their sections, with a guide its headings, with a guide and a section the text of that section only. |
| `get_pattern` | The patterns Magma ships: the solution to a task across components (where a message goes, confirming an action, an empty, a loading or a failed part), the same in every product. |
| `check_markup` | Run the Magma lint on a snippet before writing it: prop values outside their union, "false" booleans, icon-only controls without a name, raw palette classes (templates and @apply), raw colours and prefers-color-scheme queries (CSS). |
| `check_setup` | Look at the project and list what its Magma integration misses, each with the guide that fixes it: design-tokens and styles installed in the range magma depends on, the React or Angular wrapper at magma's version, the fonts of the typography, an icon set, the icon path, the lint in ESLint and Stylelint, this server in the client configuration. |
| `render_preview` | Render HTML with Magma components on the magma installed in the project, offline, and get the image (to look at, and to show the person) with its file, and a report of what in it is not representative: a component unknown or not hydrated, an element with no size, a component that shows one flat colour, a console error, an icon, a font or an image that did not load, a word broken across lines, content cut. |

## Without the server

Read the guides installed with the package: `node_modules/@maggioli-design-system/magma/AGENTS.md`, its `agents/*.md` (conventions, color, typography, theming, lint) and, for one component, `dist/collection/components/<tag>/AGENTS.md`, which links the files of its examples and mistakes beside it.
