---
# A Magma building block (#1210): the format and the commands are in docs/PATTERNS.md, "A
# building block". A section of a page becomes a block when it comes back in the same
# arrangement in two patterns or more: space, not time. The check says what is still missing:
# nx run stencil:check.patterns (after nx run stencil:build).
id: {{id}}
kind: block
title: {{title}}
group: {{group}}
layer: magma
status: draft
# The need: what the section lets the person see or do, in one sentence, no component in it.
need: >-
  {{need}}
# The rule of the block in one sentence: the bold line under the title.
principle:
# The words an agent may use for this section of a page.
keywords: []
# The needs another pattern or block answers, { need: ..., use: <id> }.
not-for: []
# What the block takes for granted.
assumptions: []
high-stakes: false
# The components the regions use.
components: []
# The patterns it comes back in, two at least: each names the block among its related.
used-by: []
# The related patterns and blocks.
related: []
# The products this default was validated on, added once one uses it.
validated-on: []

# What decides which regions show: the few variables of the page, never a domain.
#   name: { values: [a, b], means: "what the variable asks" }   (quote yes, no and numbers)
variables: {}
# The regions, in the order of the page: when each shows (values of the variables, left out =
# every combination), whether it always shows there (required), what goes in it, what to use.
#   - { id: ..., when: { <variable>: <value> }, required: true, what: "...", use: ["mds-tag attribute=value"] }
regions: []
# What holds in every product: a product layer cannot change it.
#   - { id: ..., rule: "...", checked-by: review | lint, lint: magma/<rule>, lint-planned: magma/<rule> }
always-true: []
# What a product layer may narrow: { id: ..., default: ..., may: "..." }.
open-choices: []
# Situations every application has, no domain, each with a value of every variable:
#   { situation: "...", <variable>: <value>, note: "..." }, or { situation: "...", use: <id> }.
situations: []
---

# {{title}}

****

## When to use it

<!-- The section of the page, the patterns it comes back in, and what it is not. -->

## What decides it

<!-- The variables, in words: the questions to ask about the page. -->

## Layout

<!-- How the regions stand: the order, the alignment on a wide and a narrow screen, the spaces
     between them as relations of the rhythm (rhythm/<id>). -->

## Accessibility

<!-- Landmarks, headings, what is read out. -->

## Content

<!-- The texts of each region, with examples. -->

## Magma gaps

<!-- What Magma lacks for this block, each one an issue to open. -->

## Decisions

| Date | Decision | Why |
| --- | --- | --- |
| {{date}} | Draft | {{need}} |
