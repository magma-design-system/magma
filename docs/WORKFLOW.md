# Contribution workflow and git governance

This document is the canonical reference for how work flows through this repository. It exists to keep automated agents from performing actions that break the branching model. **These rules apply to AI agents and humans alike, but agents must treat them as hard constraints: do not automate any step that this document says is manual.**

## 1. Never auto-merge `dev` or `main`

The `dev` and `main` branches are protected governance targets. **Agents must never merge into `dev` or `main`, open or auto-merge a pull request into them, or push to them directly.** These integration steps are, for now, handled manually by a maintainer.

An agent may prepare work up to (and including) a feature branch pushed to its own remote, but the promotion of that work into `dev` or `main` is a human decision.

When a maintainer promotes `dev` into `main`, the promotion must use a **merge commit** (never squash or rebase): release tags created on `dev` (e.g. `icons@*`, `svg-icons@*`) must stay reachable from `main`, otherwise the release workflows on `main` would keep recomputing already-released versions.

## 2. One branch per unit of work

Every unit of work (feature, fix, refactor, chore, etc.) must be carried out on its own dedicated branch, never directly on `dev` or `main`.

- Branch off the current `dev`.
- Use a descriptive branch name that reflects the work (for example `537-feat-governance-rules`).
- Keep unrelated changes on separate branches.

## 3. Every branch starts from an issue and is linked to it

Every unit of work must be tracked by a GitHub issue, and its branch must be linked to that issue so the work is discoverable from the issue's Development section.

- Create the branch **from the issue itself**: the "Create a branch" button in the issue's Development section, or `gh issue develop <issue-number> --base dev`. Both produce a branch named `<issue-number>-<slug>` that GitHub links automatically.
- A matching branch name alone does **not** create the link: `123-my-feature` created by hand is not connected to issue #123.
- If a branch was created manually anyway, establish the link at PR time at the latest: the PR body must contain a closing keyword referencing the issue (`Closes #123`).
- PR bodies always reference their issue with a closing keyword, even when the branch is already linked. If the PR resolves more than one issue (e.g. a branch that stacks several units of work), list **every** resolved issue and **repeat the keyword for each one** (`Closes #12, closes #34`, not `Closes #12, #34`): GitHub only closes an issue that carries its own keyword, so a bare `#34` silently stays open after the merge. Use a non-closing reference (`Refs #56`) for issues that are related but NOT resolved by the PR (e.g. the tracking epic).
- One issue, one branch: if a linked branch already exists for the issue, work on that branch instead of creating a second one; delete empty leftover branches.

## 4. Sync with `dev` before pushing

When you commit with the intention of pushing, follow this order before the push:

1. Check whether `dev` has new commits that your branch does not yet contain.
2. If it does, merge `dev` into your branch.
3. Run the linter (`npm run lint`) and the test suite (`nx run stencil:test`, plus any build affected by the change).
4. Only if the tests pass, push your branch **to its own remote branch** (never to `dev` or `main`).

If lint or the tests fail after merging `dev`, stop and resolve the failures before pushing; do not push a branch that is broken against the latest `dev`.

## Summary for agents

| Action                                          | Allowed for an agent?                                    |
| ----------------------------------------------- | -------------------------------------------------------- |
| Create a dedicated branch off `dev`             | Yes, linked to its issue (see rule 3)                    |
| Commit and push to that branch's own remote     | Yes, after syncing with `dev` and passing lint and tests |
| Merge `dev` into your feature branch            | Yes (to stay current before a push)                      |
| Merge a branch into `dev` or `main`             | No - manual governance step                              |
| Push directly to `dev` or `main`                | No - manual governance step                              |
| Auto-merge a pull request into `dev` or `main`  | No - manual governance step                              |
