---
# A domain of Foundation, the design language (#1189): the format and the commands are in
# docs/PATTERNS.md, "A domain of Foundation". The check says what is still missing:
# nx run stencil:check.patterns (after nx run stencil:build).
id: {{id}}
kind: foundation
title: {{title}}
layer: magma
status: draft
# What the rules of the domain settle, in one sentence, no component in it.
need: >-
  {{need}}
# The rule of the domain in one sentence: the bold line under the title.
principle:
# The words an agent may use for this domain.
keywords: []
# What the rules take for granted (the density, the device).
assumptions: []
# The components the cases use.
components: []
# The related domains and patterns.
related: []
# The products the rules were validated on, added once one uses them.
validated-on: []

# What decides the case: the variables of the context, never of a situation (for actions the
# region and the role of the action, for the rhythm the relation between two elements).
#   name: { values: [a, b], means: "what the variable asks" }   (quote yes, no and numbers)
variables: {}
# The cases, the rules for each combination; every case and rule says the principle it serves
# (inclusive, enabling, intuitive, flexible) and where it lives, strongest first: a component
# (mds-tag attribute=value), a custom property (--name), a utility (one class), a lint rule
# (magma/<rule>); carried-by-planned for a carrier not built yet, the case giving today's value.
#   - { id: ..., <variable>: <value>, where: "...", use: ["mds-tag attribute=value"], serves: intuitive, carried-by: [...], carried-by-planned: [...] }
cases: []
# The combinations still open, { <variable>: <value>, note: "the question" }; none once decided.
gaps: []
# The combinations with no meaning, { <variable>: <value>, why: "..." }.
not-applicable: []
# What holds in every product: a product layer cannot change it.
#   - { id: ..., rule: "...", serves: ..., checked-by: review | lint, lint: magma/<rule>, carried-by: [...] }
always-true: []
# What a product layer may narrow: { id: ..., default: ..., may: "..." }.
open-choices: []
# Situations every application has, no domain, each with its cases: { situation: "...", case: <id> }.
situations: []
---

# {{title}}

****

## When to use it

<!-- What the domain settles, and what it leaves to the components and the patterns. -->

## What decides it

<!-- The variables, in words: the questions to ask about the context. -->

## Magma gaps

<!-- The carriers not built yet, and what Magma lacks for the rules, each one an issue. -->

## Decisions

| Date | Decision | Why |
| --- | --- | --- |
| {{date}} | Draft | {{need}} |
