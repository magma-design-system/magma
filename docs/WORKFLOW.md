# Contribution workflow and git governance

This document is the canonical reference for how work flows through this repository. It exists to keep automated agents from performing actions that break the branching model. **These rules apply to AI agents and humans alike, but agents must treat them as hard constraints: do not automate any step that this document says is manual.**

## 1. Never auto-merge `dev` or `main`

The `dev` and `main` branches are protected governance targets. **Agents must never merge into `dev` or `main`, open or auto-merge a pull request into them, or push to them directly.** These integration steps are, for now, handled manually by a maintainer.

An agent may prepare work up to (and including) a feature branch pushed to its own remote, but the promotion of that work into `dev` or `main` is a human decision.

## 2. One branch per unit of work

Every unit of work (feature, fix, refactor, chore, etc.) must be carried out on its own dedicated branch, never directly on `dev` or `main`.

- Branch off the current `dev`.
- Use a descriptive branch name that reflects the work (for example `537-feat-governance-rules`).
- Keep unrelated changes on separate branches.

## 3. Sync with `dev` before pushing

When you commit with the intention of pushing, follow this order before the push:

1. Check whether `dev` has new commits that your branch does not yet contain.
2. If it does, merge `dev` into your branch.
3. Run the test suite (`nx run stencil:test`, plus any build affected by the change).
4. Only if the tests pass, push your branch **to its own remote branch** (never to `dev` or `main`).

If the tests fail after merging `dev`, stop and resolve the failures before pushing; do not push a branch that is broken against the latest `dev`.

## Summary for agents

| Action                                          | Allowed for an agent?                          |
| ----------------------------------------------- | ---------------------------------------------- |
| Create a dedicated branch off `dev`             | Yes                                            |
| Commit and push to that branch's own remote     | Yes, after syncing with `dev` and passing tests |
| Merge `dev` into your feature branch            | Yes (to stay current before a push)            |
| Merge a branch into `dev` or `main`             | No - manual governance step                    |
| Push directly to `dev` or `main`                | No - manual governance step                    |
| Auto-merge a pull request into `dev` or `main`  | No - manual governance step                    |
