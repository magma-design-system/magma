# Contribution workflow and git governance

This document is the canonical reference for how work flows through this repository. It exists to keep automated agents from performing actions that break the branching model. **These rules apply to AI agents and humans alike, but agents must treat them as hard constraints: do not automate any step that this document says is manual.**

## 1. Never merge into `main` around the queue, never release by hand

`main` is the only long-lived branch: the trunk every branch starts from, the branch the merge queue feeds, the branch Storybook deploys from and the branch every package releases from. It is a protected governance target. **Agents must never merge into `main`, add a pull request to its merge queue, enable auto-merge on one, push to it directly or start a release.** These steps are a maintainer's.

An agent may prepare work up to (and including) a feature branch pushed to its own remote and a pull request opened from it into `main`, but merging that pull request - the promotion of the work into `main` - is a human decision.

**No branch is merged into `main` while its pipeline is red.** Every check of the pull request must pass on its head commit at the time of the merge; a red check is never bypassed, whatever the size of the change (a one-line dependency bump included). When the failure comes from outside the PR (a flaky job, an outage), rerun or fix it first. `main` must install, build and lint at every commit: every other branch syncs from it (rule 4), so a red merge breaks all of them at once.

**Every pull request into `main` is merged through the merge queue.** A maintainer reviews it (rule 6) and adds it to the queue of `main` ("Merge when ready"). GitHub tests it on top of `main` and of the pull requests ahead of it, in a temporary `gh-readonly-queue/main/...` branch, with the same required checks, and merges it with a merge commit when they pass; several queued pull requests can be tested in one group. So:

- Nobody merges a pull request into `main` around the queue, and nobody merges `main` into a branch only to make it mergeable: the queue tests each pull request against the `main` it will land on, which is what updating every branch by hand after each merge used to do.
- Adding a pull request to the queue is a merge: a maintainer's decision, never an agent's, like auto-merge.
- When the queue removes a pull request (a red check in its group, or a conflict with `main`), it goes back to its author: merge `main` into the branch, resolve the conflicts, regenerate the generated files (readmes, `magma.api.txt`, `components.d.ts`) with a build instead of merging them by hand, run lint and tests (rule 4), push, and the maintainer queues it again.
- In a merge group every package pipeline builds and tests, whatever the pull requests change (the `changes` gate of `_package-pipeline.yml` lets everything through on `merge_group`): the group is the last gate before `main`.
- **Not while a release runs.** Before adding a pull request to the queue or enabling auto-merge, check that no `release` run is in progress (`gh run list --workflow release.yml --status in_progress`): a merge that lands on `main` between the dispatch of a stable release and its push makes the release fail (nothing is tagged, the maintainer re-runs it). An agent asked to prepare such a merge warns and waits for the run to end.

`main` cannot be deleted (the `no-deletion` ruleset, with no bypass) and takes merge commits only. Both rules come from history: the repository deletes the head branch of every merged pull request, which is how `main` disappeared on 2026-10-16 when a pull request opened from it (#954) was merged; and that same pull request was merged with a rebase, which left the tagged release commit out of the history. **Never open a pull request whose head is `main`.**

### Releases

Every package releases from `main`, by hand, with the `release` workflow: "Run workflow" in Actions, on the `main` branch (the header of `.github/workflows/release.yml` is the reference). It works on the commit `main` points to when it is dispatched, whatever lands on `main` while it runs, and waits for the approval of the `release` environment (its required reviewers): approve right away, the time spent waiting is time for `main` to move. `dry-run: true` writes the plan (package, next version, tag, previous tag) to the job summary without approval, build, commit, tag or push: run it first.

- **`channel: stable`** detects the next version of each package from the conventional commits of its own scopes (`docs/COMMITS.md`), writes the new versions, updates the pins of the packages that depend on them (e.g. a new `design-tokens` is pinned in `styles` and `magma` before they are published) together with `package-lock.json` and the `CHANGELOG.md` sections, and pushes all of it in **one** `chore(release)` commit straight to `main` with the release token, with one tag and one GitHub release per package. The push is not rebased: when `main` moved since the dispatch it is rejected, the run fails before any tag exists, and the maintainer re-runs it on the new tip. CI and the npm publish then run once, on that commit (`publish.yml`: on `main` it publishes `chore(release)` commits only, so a version bumped by hand in a pull request never ships). Internal dependencies are pinned as caret ranges (`^<version>`), so a patch or minor of a dependency is accepted by the dependents already on npm and consumers keep a single copy of it; only `magma` is pinned to the exact version in `magma-react` and `magma-angular`, which are released in lockstep with it under the `magma@*` tag. A dependent without commits of its own gets the new pin but no new version: it ships the pin with its next release. A major of a dependency reaches the published dependents only with a release of their own.
- **`channel: beta`** is the magma prerelease channel. Nothing is committed: the `magma@<next stable>-beta.N` tag goes on the dispatched commit, with the semantic-release channel note that continues the counter (a second beta without a stable in between is `beta.N+1`; the next stable resets it: after `2.2.0-beta.2` comes `2.2.0`, then `2.3.0-beta.1`), the workflow builds `magma`, `magma-react` and `magma-angular`, and `publish.yml` writes the tag version into their manifests right before publishing with the `beta` dist-tag. The consequence: the `version` fields in the manifests are not the published prerelease, the tag is.
- **`icons` and `svg-icons` also release on their own**, on every push to `main` that touches them (`icons.release.yml`, `svg-icons.release.yml`): their `chore(release)` commit lands on `main` with a rebase-retry and publishes the same way, so icon additions ship as soon as their pull request lands, and the manual release finds nothing left to do for them.
- A failed publish is re-run from Actions (`publish.yml`, "Run workflow", `sha` = the release commit, or the beta-tagged one): the tags stay, the published versions are skipped.

`support/v1.x` is the maintenance line of the previous major, with its own CI and manual publish (its `publish v1.x` workflow); nothing here applies to it.

## 2. One branch per unit of work

Every unit of work (feature, fix, refactor, chore, etc.) must be carried out on its own dedicated branch, never directly on `main`.

- Branch off the current `main`.
- Use a descriptive branch name that reflects the work (for example `537-feat-governance-rules`).
- Keep unrelated changes on separate branches.

## 3. Every branch starts from an issue and is linked to it

Every unit of work must be tracked by a GitHub issue, and its branch must be linked to that issue so the work is discoverable from the issue's Development section.

- Create the branch **from the issue itself**: the "Create a branch" button in the issue's Development section, or `gh issue develop <issue-number> --base main`. Both produce a branch named `<issue-number>-<slug>` that GitHub links automatically.
- A matching branch name alone does **not** create the link: `123-my-feature` created by hand is not connected to issue #123.
- If a branch was created manually anyway, establish the link at PR time at the latest: the PR body must contain a closing keyword referencing the issue (`Closes #123`).
- PR bodies always reference their issue with a closing keyword, even when the branch is already linked. If the PR resolves more than one issue (e.g. a branch that stacks several units of work), list **every** resolved issue and **repeat the keyword for each one** (`Closes #12, closes #34`, not `Closes #12, #34`): GitHub only closes an issue that carries its own keyword, so a bare `#34` silently stays open after the merge. Use a non-closing reference (`Refs #56`) for issues that are related but NOT resolved by the PR (e.g. the tracking epic).
- One issue, one branch: if a linked branch already exists for the issue, work on that branch instead of creating a second one; delete empty leftover branches.

## 4. Sync with `main` before pushing

When you commit with the intention of pushing, follow this order before the push:

1. Check whether `main` has new commits that your branch does not yet contain.
2. If it does, merge `main` into your branch.
3. Run the linter (`npm run lint`) and the test suite (`nx run stencil:test`, plus any build affected by the change; `nx run stencil-react:test` and `nx run stencil-angular:test` when the change touches the React or Angular output target).
4. Only if the tests pass, push your branch **to its own remote branch** (never to `main`).

If lint or the tests fail after merging `main`, stop and resolve the failures before pushing; do not push a branch that is broken against the latest `main`.

## 5. Cover every behaviour change with a test

Every change to what a component **does** must ship, in the same branch, with a test that covers the new or changed implementation, so that the change is protected against regressions.

- **Behaviour** is anything observable beyond presentation: props and their defaults, emitted events, public methods, the rendered DOM structure, keyboard and focus handling, form participation, validation, state transitions. This includes the public API of a new component.
- **Pure style changes are exempt**: padding, margin, colours, radius, typography, transitions and similar CSS-only adjustments do not need a test.
- Put the test in the component's `test/` folder: `*.spec.ts` for logic that does not need a rendered component, `*.e2e.ts` for anything that needs the live DOM. A bug fix's test should reproduce the bug: fail on the previous implementation, pass on the fix.
- How to write and run the tests (Vitest + `@stencil/vitest`, `render` / `userEvent`, shared-page caveats): `projects/stencil/HOWTO.md`.
- **Storybook is the other half.** The Vitest `spec` / `e2e` files are the unit and component tests; the `*.stories.tsx` files in the same `test/` folder add the visual, interaction (`play` functions with `expect` / `fn` from `storybook/test` and the `canvas` / `userEvent` of the play context) and accessibility (`@storybook/addon-a11y`) tests, and are the place to show and exercise several components together on one page (integration scenarios). Add or update a story when necessary: when the change affects how the component looks, how the user interacts with it, its accessibility, or how it composes with other components. A story complements the Vitest tests; it never replaces them. Run them headless with `npm run test-storybook` (from `projects/stencil`): the `storybook` project of `vitest.config.mts`.

A pull request that changes a component's behaviour without a covering test is not ready for review.

## 6. Review by risk level

Every pull request gets a review level from the `pr-risk` workflow: a `risk-*` label, and one comment (updated on every push) that says what to look at. The level is the highest the PR reaches, computed from git, not declared:

| Label            | Set when                                                                                     | Review                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `risk-contract`  | `projects/stencil/magma.api.txt` changes: the public component API                          | every member the comment lists: each must be intended, and the release must say so |
| `risk-behaviour` | shipped code changes (components, wrappers, codemods, the consumer-facing fields of a manifest) | the tests that cover it: do they describe the new behaviour, would they fail on the old code? |
| `risk-visual`    | only CSS, tokens, styles, icons or brand assets change                                        | the rendered result (the stories involved), not the CSS                 |
| `risk-low`       | docs, tests, stories, tooling or CI only                                                      | a green CI is enough                                                    |

The same workflow checks the release. Each changed member of the snapshot needs a release: a removal or a narrowing (fewer accepted values, a new default, a lost `reflect` or `bubbles`, a new required prop, a changed signature) is **major**, an addition or a widening is **minor**. The commits of the PR in magma's release scopes must declare at least that, the way semantic-release reads them (`docs/COMMITS.md`): otherwise the job fails, because the break would ship as a minor or a patch. Declare a break with `!` after the type or scope or a `BREAKING CHANGE:` footer. A change the check rates as a break that no consumer can tell apart from the old API (a new default for a value that never had an effect, say) is declared instead with an `API-Compatible: <member>: <reason>` footer, one per member, named as the comment names it (`API-Compatible: mds-button-dropdown prop type: <reason>`): the member then needs a minor, and the comment shows the reason for the reviewer to weigh.

Keep a PR to one level when you can: a behaviour fix and a CSS touch-up in two PRs get two quick reviews instead of one careful one. Run the same check locally with `nx run stencil:check.pr-risk` (after committing; `-- --base-snapshot <file>` compares with another snapshot, e.g. a release's).

## 7. Label issues by the project they come from

An issue opened for a problem found in another project (the docs site, a consumer app) carries that project's **origin label**, `prd-<project>`, so that what each project reported can be listed with one filter, and the project can be told when its issues are fixed.

| Label       | The issue comes from                      |
| ----------- | ----------------------------------------- |
| `prd-docs`  | the docs site, `magma-design-system/docs` |
| `prd-mindy` | Mindy (`mindy-webapp`)                    |

- Set it when the issue is opened, whoever opens it, agent or human.
- It says where the problem was seen, not which package it affects: that is still the `prg-*` label, and an issue usually carries both (`prd-mindy` and `prg-stencil`). A problem reported by more than one project gets one origin label per project.
- An issue found in Magma itself (its Storybook, its tests, its own docs, a review) has no origin label.
- The label is the filter, not the context: the body still says where and how the problem was seen (app, versions, steps).
- A new project gets its label before its first issue: add `prd-<project>` (short, lowercase, kebab-case) to the Origin section of `.github/ISSUE_TEMPLATE/labels.yml`, in the same colour, and create it on the repository with the same name, colour and description (`gh label create`, or the `label-sync` workflow). A label that exists only on GitHub is deleted by the next `label-sync` run, which removes every label the file does not list.
- The description reads `Reported from <project> (<repository>)`: agents working inside a consumer project find their label by matching the repository name. They follow `docs/agents/reporting.md`, shipped in the `magma`, `magma-react` and `magma-angular` packages as `agents/reporting.md`, and never create a label themselves: when their project has none, the issue body names the project and proposes its `prd-<project>` name, and a maintainer adds that label as above.

## Summary for agents

| Action                                          | Allowed for an agent?                                    |
| ----------------------------------------------- | -------------------------------------------------------- |
| Create a dedicated branch off `main`            | Yes, linked to its issue (see rule 3)                    |
| Commit and push to that branch's own remote     | Yes, after syncing with `main` and passing lint and tests |
| Merge `main` into your feature branch           | Yes (to stay current before a push)                      |
| Open a pull request from it into `main`         | Yes, with `Closes #<issue>` in the body (see rule 3)     |
| Open a pull request whose head is `main`        | No - never: its merge deletes `main` (rule 1)            |
| Change a component's behaviour without a test   | No - add or update a `spec` / `e2e` test (see rule 5)    |
| Ship an API removal without declaring the break | No - `!` or a `BREAKING CHANGE:` footer (see rule 6)     |
| Open an issue for a problem found elsewhere     | Yes, with its `prd-<project>` origin label (see rule 7)  |
| Merge a branch into `main`                      | No - manual governance step                              |
| Merge a branch with a red pipeline into `main`  | No - nobody does, a red check is never bypassed (rule 1) |
| Push directly to `main`                         | No - manual governance step                              |
| Auto-merge a pull request into `main`           | No - manual governance step                              |
| Add a pull request to the merge queue of `main` | No - a maintainer's merge decision (rule 1)              |
| Queue or auto-merge a pull request while a `release` run is in progress | No - warn and wait for the run to end (rule 1) |
| Merge `main` into a branch only to make it mergeable | No need - the merge queue tests it on top of `main` (rule 1) |
| Fix a pull request the merge queue removed      | Yes - merge `main`, resolve, rebuild, lint and test, push (rule 1) |
| Start a release (`release` workflow), approve it | No - a maintainer's decision; a dry-run is fine (rule 1) |
