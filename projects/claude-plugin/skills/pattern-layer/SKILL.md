---
name: pattern-layer
description: Adapt a Magma pattern to this product. Write its layer in magma/patterns/<id>.md, which fixes the open choices the pattern leaves to each product (a toast duration, the wording of its messages) and maps the situations of the product's domain to the cases of the pattern, then check it with the magma MCP server until get_pattern applies it. Use when a product wants a Magma pattern (where a message goes, confirming an action, an empty, a loading or a failed part) narrowed for itself, its own situations answered, or a pattern of its own for a need Magma does not cover yet.
license: MIT
compatibility: A project with @maggioli-design-system/magma installed. Uses the magma MCP server of this plugin.
metadata:
  source: https://github.com/magma-design-system/magma/tree/main/projects/claude-plugin
---

<!-- Generated from projects/claude-plugin/templates/pattern-layer.md by scripts/skills.ts: edit the template. -->

# Adapt a Magma pattern to this product

What to adapt, if given with the command (a pattern, a need, a choice of the product): $ARGUMENTS.

A layer narrows, it never overrides: the "Always true" rules and the cases of a pattern are the same in every product. The format is the section "A product's layer" of the patterns guide: `get_guide` patterns, section "A product's layer".

## 1. The pattern

`get_pattern` with the need in words, or with the id if the person named one; then `get_pattern` with the id for the whole pattern: its variables, cases, "Always true" rules, open choices (each with its `default` and what a product `may`) and situations, with the layer of this project already applied if there is one (`layers`).

- A candidate, or no pattern for the need: there is nothing to narrow. Go to step 5.
- A layer already exists (the file the answer names in `layerFile`): change that file, never write a second one.

## 2. What the product decides

Ask the person, one question at a time, with the Magma default as the recommended answer:

- for each open choice: keep the default, or a value within what it `may`;
- the situations of the product this pattern should answer, in the product's words. For each one, `get_pattern` with the id and the values of its variables: the case it returns is the one the situation maps to; when the answer lists `missing` variables, ask them.

A wish that changes an "Always true" rule, a case, or a choice the pattern does not leave open is not a layer: say so, and propose an issue on Magma (`get_guide` reporting); write it only once the person agrees.

## 3. The file

Write the file the answer of step 1 names in `layerFile` (`magma/patterns/<id>.md` of the project, which may be a folder below the one you work in): `id` and `extends: magma:<id>` of the Magma pattern, `layer` with the name of the product, `narrows` with the choices that differ from the default, `situations` with the cases they map to. In the body, under `## Why`, one line per choice with its reason and today's date: the history whoever changes it next reads first.

## 4. The check

- `get_pattern` without arguments: `layerErrors` lists what is wrong in `magma/patterns/`. Fix the file until it lists nothing for it; a layer with an error is not applied, and the answers stay Magma's default.
- `get_pattern` with the id: each choice the layer fixes carries `narrowed-by`, each situation it adds carries `layer`.
- `get_pattern` with the id and the values of one situation of the product: the case is the one the layer maps it to.

## 5. A need Magma does not cover

Tell the person no Magma default covers it. Before anything else, the components that hold the role the need asks (a field, a target to drop files on, a bar of actions): `find_component` with the need in words, `get_component` and `get_usage` for each, and `render_preview` of it in the context of the flow (inside a card, a row, a dialog). Then say which of these holds:

- a component does the job as it is: the pattern of the product stands on it, and adds nothing it already does;
- a component holds the role, but not as the flow needs (it does not fit the context, or breaks a rule of the design language or of accessibility): that component is the issue to propose, with what the render showed; never build a second way to do what it does;
- an existing, simpler way already meets the need: use it, and write no pattern;
- no component holds the role: say so in the issue.

Propose the issue on Magma (`get_guide` reporting, a flow no pattern covers), naming the components you checked and what you found. If the product cannot wait, offer a pattern of its own in the same folder (`layerDir` of `get_pattern` without arguments): the shape of a Magma pattern (read one in `node_modules/@maggioli-design-system/magma/agents/patterns/`), its own `layer`, no `extends`, never an id Magma has; then the check of step 4, which holds it to the format, the cases and the components of this release. A pattern that comes back in two or three products is the one to propose to Magma.

## 6. The report

The file written, the choices it fixes and the situations it adds, what the check said, and the issues proposed to Magma. Commit nothing unless the person asks to: the layer is the team's, review it as code.
