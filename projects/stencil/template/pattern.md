---
# A Magma pattern: the format and the commands are in docs/PATTERNS.md.
# Each field answers one of the questions that define a pattern. The check says what is still
# missing: nx run stencil:check.patterns (after nx run stencil:build).
id: {{id}}
kind: pattern
title: {{title}}
group: {{group}}
layer: magma
status: draft
# 1. The need: what the person must do or know, in one sentence, no component in it.
need: >-
  {{need}}
# The rule of the pattern in one sentence: the bold line under the title.
principle:
# The words an agent may use for this need.
keywords: []
# 2. When not: the needs another pattern answers, { need: ..., use: <id> }.
not-for: []
# 3. The assumptions the default takes for granted (density, device, amount of data, kind of user).
assumptions: []
# 8. High stakes: payments, destructive actions, legal and consent steps default to asking.
high-stakes: false
# The components the cases use.
components: []
# 11. The related patterns.
related: []
# 13. The products this default was validated on, added once one uses it.
validated-on: []

# What decides the case: the few variables of the situation, never a domain.
#   name: { values: [a, b], means: "what the variable asks" }   (quote yes, no and numbers)
variables: {}
# 4-6. The cases, as values of the variables: a variable left out means any of its values,
# except decision, which means none; a list of values means any of them.
#   - { id: ..., <variable>: <value>, where: "...", use: ["mds-tag attribute=value"], see: <case or pattern>, magma-gap: "...", rules: [<domain>/<id>] }
# rules: the rules and relations of the domains of Foundation the case and its preview rely on.
cases: []
# The combinations still open, { <variable>: <value>, note: "the question" }; none once decided.
gaps: []
# The combinations with no meaning, { <variable>: <value>, why: "..." }.
not-applicable: []
# 7. What holds in every product: a product layer cannot change it.
#   - { id: ..., rule: "...", checked-by: review | lint, lint: magma/<rule>, lint-planned: magma/<rule> }
always-true: []
# What a product layer may narrow: { id: ..., default: ..., may: "..." }.
open-choices: []
# Situations every application has, no domain, each with its case: { situation: "...", case: <id> }.
situations: []
---

# {{title}}

****

## When to use it

<!-- 1 and 2: the need, and when not (the patterns that answer the neighbouring needs). -->

## What decides it

<!-- The variables, in words: the questions to ask about the situation. -->

## Parts

<!-- 4: the components and how they are put together. -->

## Behaviour over time

<!-- 5: what happens on each step: the focus, the waits, what stays, what goes. -->

## Accessibility

<!-- 9: keyboard, focus, what is read out. -->

## Content

<!-- 10: the texts, with examples. -->

## Magma gaps

<!-- 12: what Magma lacks for this pattern, each one an issue to open. -->

## Decisions

| Date | Decision | Why |
| --- | --- | --- |
| {{date}} | Draft | {{need}} |
