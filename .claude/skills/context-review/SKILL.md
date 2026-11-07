---
name: context-review
description: Review the agent context of this repository at the end of a unit of work, before its pull request - bring AGENTS.md, docs/, the READMEs and SPECs, the guides of docs/agents/ and the skills up to date with what the branch changed, and check that what every session loads stays small. Use when a unit of work is done, before opening or updating its pull request, or when asked whether the docs and the agent context are current.
argument-hint: [base branch, main by default]
---

# Review the agent context

The base to compare with: $ARGUMENTS, or `origin/main` when it is empty. The rule is rule 8 of
`docs/WORKFLOW.md`. What a machine can see is held by `nx run magma:check.agent-context`
(`scripts/agent-context.ts`, also run in CI); this skill is the part that needs judgement.

## 1. What the branch changed

```bash
git fetch origin main
git log --oneline origin/main..HEAD
git diff --stat origin/main...HEAD
```

List what the branch adds, renames, moves or removes that a document may describe: a component
or a member of its API, a token or a utility, a command (an Nx target, a script), a project, a
file or an export another project reads, a rule a check or the lint enforces, a skill, a tool of
the MCP server.

## 2. The checks

```bash
npx nx run magma:check.agent-context
```

It needs no build. Then, by what the branch touched:

- a component, a guide of `docs/agents/` or a pattern: after `npx nx run stencil:build`,
  `stencil:check.usage-docs`, `stencil:check.patterns`, `stencil:check.api-snapshot`;
- the MCP server, the lint or the guides the plugin lists: `npx nx run claude-plugin:build`,
  then `claude-plugin:check`;
- what one project reads of another: `npx nx run magma:check.diagrams`;
- after any build, `git status`: a tracked file the build changed is a generated file the branch
  must commit (a `readme.md`, `magma.api.txt`).

Fix what they report before going on.

## 3. What the context must now say

For each change of step 1, find every document that names it, under its old name and its new one
(`git grep -n`), and ask:

- the index: a new document, project, command or skill has its row in `AGENTS.md` ("Commands",
  "Sub-projects and build order", "Documentation index");
- the contracts: a file, an export or a command another project reads has its entry in
  `docs/CONTRACTS.md`, with the check that holds it;
- the mistakes: a mistake made on this branch that no lint or check catches has its line in
  "Mistakes agents make here" of `AGENTS.md`, short, pointing to the rule it breaks;
- the description: the README, SPEC and HOWTO of the project, the usage docs of a component and
  the guides of `docs/agents/` describe the new behaviour; a removed thing is gone from them, a
  renamed one is renamed everywhere;
- the consumer side: a change a consumer project sees reaches `docs/agents/` (shipped as
  `agents/*.md`), and a tool of the MCP server its guide `docs/agents/mcp.md`.

Write the criterion and its source next to each choice you write down, as `AGENTS.md` asks.

## 4. How the context is split

The check prints what every session loads, against its budget, and the largest documents. Read
them with the diff:

- what every session loads (`CLAUDE.md`, `AGENTS.md`, the names and descriptions of the project
  skills) holds what applies to every task: a rule, a pointer. A procedure for one kind of task
  goes into the document the index routes to, or into a skill. The budget is `BUDGET` in
  `scripts/agent-context.ts`: raise it only with the reason in the comment next to it;
- a document the branch made grow: does one task need all of it? A section only some tasks read,
  in a large document, can become a document of its own with its row in the index;
- the same fact in two places: keep it where it is decided and point to it from the other, or
  hold the copy with a check, as `check.agent-context` holds the commit scopes;
- a count or a list written by hand that will change: write it without the number when the number
  is incidental ("every component"), or let a check hold it.

A restructuring larger than the branch is a proposal to the maintainer, with the numbers the check
printed, not a change on the branch.

## 5. Report

In the pull request: one line per document updated and why, and the line the check printed (what
every session loads, against the budget). When nothing needed to change, say so.
