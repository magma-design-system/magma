---
name: pattern-list
description: List the Magma patterns of this repository with their group, status and the products they were validated on; read only. Filters by group, by status, or the ones not validated on any product. Use when a maintainer asks which patterns exist, which are candidates, or what is left to define.
argument-hint: "[group] [candidate|draft|decided] [not validated]"
---

# The patterns

Read only: this command changes nothing. The filters, if any: $ARGUMENTS.

Run, from the root of the repository, with the filters the arguments name:

```bash
npx nx run stencil:list.patterns -- [--kind pattern|foundation] [--group <group>] [--status candidate|draft|decided] [--not-validated]
```

The domains of Foundation (`kind: foundation`, the design language of #1189) come first, with
no group. The groups are `navigation`, `data`, `input`, `messages-and-states` and `ai`. It is the same
list the `get_pattern` tool of the MCP server gives with no argument, read from
`docs/agents/patterns/`.

Show it as it comes, by group. Then, in one line each: how many are candidates (needs Magma knows
and has not defined), and which defined ones were validated on no product yet. To define a
candidate: `/pattern-new`; to change a pattern: `/pattern-change <id>`.
