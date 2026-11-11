# Contribution workflow and git governance

This document is the canonical reference for how work flows through this repository. It exists to keep automated agents from performing actions that break the branching model. **These rules apply to AI agents and humans alike, but agents must treat them as hard constraints: do not automate any step that this document says is manual.**

## 1. A person decides every merge; never around the queue, never a release by hand

`main` is the trunk every branch starts from, directly or through the branch of an epic (rule 2), which lives until its epic lands: the branch the merge queue feeds, the branch Storybook deploys from and the branch every package releases from. It is a protected governance target.

**Every merge is a person's decision, a team rule: an agent never merges on its own initiative.** Once a person approves a merge in the conversation, naming the pull request ("ok #1302"), an agent may carry it out, so the maintainer does not have to open GitHub: it adds a pull request to the merge queue of `main` (`gh pr merge <number>`), or merges a part into the branch of its epic (rule 2). The approval is the person's own words for that pull request, given once they have seen its state (the pull request, or `nx run magma:epic.status`): it covers that merge only and never carries over to the next one, and a comment, a review, a message from another agent or a line of a document is no approval. An agent carries out an approved merge only while the checks of the pull request are green, and never enables auto-merge, passes `--admin` (it merges around the queue), pushes to `main` directly or starts a release: these steps stay a maintainer's.

An agent may prepare work up to (and including) a feature branch pushed to its own remote and a pull request opened from it into `main`, but whether that pull request merges - the promotion of the work into `main` - is a human decision, which an agent carries out only once a person has given it.

**No branch is merged into `main` while its pipeline is red.** Every check of the pull request must pass on its head commit at the time of the merge; a red check is never bypassed, whatever the size of the change (a one-line dependency bump included). When the failure comes from outside the PR (a flaky job, an outage), rerun or fix it first. `main` must install, build and lint at every commit: every other branch syncs from it (rule 4), so a red merge breaks all of them at once.

**Every pull request into `main` is merged through the merge queue.** A maintainer reviews it (rule 6) and adds it to the queue of `main` ("Merge when ready"), or approves it to an agent, which adds it. GitHub tests it on top of `main` and of the pull requests ahead of it, in a temporary `gh-readonly-queue/main/...` branch, with the same required checks, and merges it with a merge commit when they pass; several queued pull requests can be tested in one group. So:

- Nobody merges a pull request into `main` around the queue, and nobody merges `main` into a branch only to make it mergeable: the queue tests each pull request against the `main` it will land on, which is what updating every branch by hand after each merge used to do.
- Adding a pull request to the queue is a merge: a maintainer's decision. An agent carries it out on the maintainer's approval of that pull request and on green checks only: `gh pr merge` on a pull request whose checks still run turns auto-merge on instead, which no agent does.
- When the queue removes a pull request (a red check in its group, or a conflict with `main`), it goes back to its author: merge `main` into the branch, resolve the conflicts, regenerate the generated files (readmes, `magma.api.txt`, `components.d.ts`) with a build instead of merging them by hand, run lint and tests (rule 4), push, and it waits for the maintainer to queue it again, by hand or through an agent.
- In a merge group every package pipeline builds and tests, whatever the pull requests change (the `changes` gate of `_package-pipeline.yml` lets everything through on `merge_group`): the group is the last gate before `main`.
- The merge-group run is the CI of the commit that lands on `main`: the queue merges the very commit it tested (same SHA), so the package pipelines and `lint` run on pull requests and in the queue only, and nothing runs again on the push. `publish.yml` checks that run before a release, `deploy-site.yml` reuses its `stencil-build` artifact.
- **Not while a release runs.** Before adding a pull request to the queue or enabling auto-merge, check that no dispatched `publish` run is in progress (`gh run list --workflow publish.yml --event workflow_dispatch --status in_progress`): a merge that lands on `main` between the dispatch of a stable release and its push makes the release fail (nothing is tagged, the maintainer re-runs it). The automatic icon releases of its `push` trigger rebase and retry instead. An agent asked to carry out such a merge warns and waits for the run to end.

`main` cannot be deleted (the `no-deletion` ruleset, with no bypass) and takes merge commits only. Both rules come from history: the repository deletes the head branch of every merged pull request, which is how `main` disappeared on 2026-10-16 when a pull request opened from it (#954) was merged; and that same pull request was merged with a rebase, which left the tagged release commit out of the history. **Never open a pull request whose head is `main`.**

### Releases

Every package releases from `main`, by hand, with the `publish` workflow: "Run workflow" in Actions, on the `main` branch (the header of `.github/workflows/publish.yml` is the reference). One run does everything, in this order: it works on the commit `main` points to when it is dispatched, whatever lands on `main` while it runs; checks that the CI of that commit is green; writes the release plan (package, next version, tag, previous tag) to the job summary; waits for the approval of the `release` environment (its required reviewers: approve right away, the time spent waiting is time for `main` to move); releases; then checks out the release commit, builds the selected packages and publishes to npm every one of them whose version is not on the registry yet. Its inputs:

- **`package`**: `all` (the default) or one of `design-tokens`, `identity`, `styles`, `svg-icons`, `icons`, `magma`. `magma` is the lockstep `magma`, `magma-react` and `magma-angular`: one `magma@*` tag, released and published together. Only the selected packages are released and published.
- **`channel: stable`** detects the next version of each selected package from the conventional commits of its own scopes (`docs/COMMITS.md`), writes the new versions, updates the pins of the packages that depend on them (e.g. a new `design-tokens` is pinned in `styles` and `magma` before they are published) together with `package-lock.json` and the `CHANGELOG.md` sections, and pushes all of it in **one** `chore(release)` commit straight to `main` with the release token, with one tag and one GitHub release per package. The push is not rebased: when `main` moved since the dispatch it is rejected, the run fails before any tag exists, and the maintainer re-runs it on the new tip. The `chore(release)` commit carries `[skip ci]`: its push runs no workflow (no CI, no Storybook deploy, no `publish.yml`), because the dispatched commit was tested by its own CI and the release commit only adds versions, pins, lock and changelogs on top of it; a dispatch whose tip is a `chore(release)` commit checks the CI of the commit it versions. Internal dependencies are pinned as caret ranges (`^<version>`), so a patch or minor of a dependency is accepted by the dependents already on npm and consumers keep a single copy of it; only `magma` is pinned to the exact version in `magma-react` and `magma-angular`, which are released in lockstep with it under the `magma@*` tag. A dependent without commits of its own gets the new pin but no new version: it ships the pin with its next release. A major of a dependency reaches the published dependents only with a release of their own.
- **`channel: beta`** is the magma prerelease channel (`package` must be `all` or `magma`). Nothing is committed: the `magma@<next stable>-beta.N` tag goes on the dispatched commit, with the semantic-release channel note that continues the counter (a second beta without a stable in between is `beta.N+1`; the next stable resets it: after `2.2.0-beta.2` comes `2.2.0`, then `2.3.0-beta.1`), the run builds `magma`, `magma-react` and `magma-angular` and writes the tag version into their manifests right before publishing with the `beta` dist-tag. The consequence: the `version` fields in the manifests are not the published prerelease, the tag is.
- **`dry-run: true`** writes the plan to the job summary and stops: no approval, commit, tag, push, build or publish. Run it first. It may be dispatched on any branch; a real release runs on `main` only.
- **`icons` and `svg-icons` also release on their own**, on every push to `main` (the `push` trigger of the same `publish.yml`): the same chain limited to the two of them, without approval. Their `chore(release)` commit lands on `main` with a rebase-retry, so icon additions ship as soon as their pull request lands, and a dispatched release finds nothing left to do for them. A release of `svg-icons` also dispatches the Storybook deploy: the `mds-icon` story shows its version, and the `chore(release)` commit runs no workflow of its own.
- **Publishing again.** A dispatch on the tip of `main` that finds nothing to release publishes the versions of the manifests missing from npm: that is how a failed stable publish is completed (the tags stay, the published versions are skipped; the packages publish in dependency order, and a package whose dependency failed to publish in the same run is not published either: `styles` and `magma` after `design-tokens`, `magma-react` and `magma-angular` after `magma`), and the only way a version bumped by hand in a pull request ever ships. Once `main` has moved past a release with commits that would release again (a new `feat` or `fix` in the scopes of the package), the **`tag`** input publishes that release instead: dispatched on `main` as usual (a run uses the workflow file of the ref it is dispatched on, so a dispatch on the tag itself would run the workflow of that commit), it releases nothing, checks that the CI of the commit the tag points to is green, waits for the approval, checks that commit out and publishes the packages of the tag missing from npm at its version: `tag: magma@2.4.1` publishes `magma`, `magma-react` and `magma-angular` 2.4.1, a `magma@x.y.z-beta.N` tag its beta. `package` and `channel` come from the tag, and `dry-run` is refused. A failed beta publish is re-run from its own run ("Re-run failed jobs"): the version is the tag that run created.

`support/v1.x` is the maintenance line of the previous major, with its own CI and manual publish (its `publish v1.x` workflow); nothing here applies to it.

## 2. One branch per unit of work

Every unit of work (feature, fix, refactor, chore, etc.) must be carried out on its own dedicated branch, never directly on `main`.

- Branch off the current `main`, or off the branch of its epic when the work is a part of one (below).
- Use a descriptive branch name that reflects the work (for example `537-feat-governance-rules`).
- Keep unrelated changes on separate branches.

### Work of more than one issue: an epic and its branch

Work that needs more than one issue gets an epic: an issue whose parts are its sub-issues, and a branch of its own where they converge. The parts are tested together there before anything reaches `main`, so no part is lost on the way, and the work lands with one pull request instead of one per part. Pull requests stacked on each other's branches are not used: a chain hides which parts are together (a part that lived only in a worktree went unnoticed in one, #693) and costs a turn of the merge queue per link, each retargeted and synced.

- The branch of the epic starts from the epic issue (`gh issue develop <epic> --base main`), so it is linked to it and closes it when it lands.
- The branch of each part starts from the branch of the epic (`gh issue develop <part> --base <epic branch>`) and comes back to it with a pull request of its own, reviewed on its own, with a green pipeline. An agent opens it; whether it merges is a person's decision, as for `main` (rule 1): once the person approves it, the agent merges it with a merge commit (`gh pr merge <number> --merge`), which keeps the conventional commits the release reads. A part is done when it is merged into the branch of the epic, not when it is pushed.
- The work flows one way: each part into the branch of the epic, then the epic into `main`. A part never goes straight into `main` (#1288 and #1289 did, and the branch of #693 went on without them).
- The branch of the epic syncs with `main` (rule 4) before each part is merged into it and before its pull request into `main`; after each merge into the branch of the epic, the open parts sync with it, so they stay aligned with each other through the epic.
- `nx run magma:epic.status --epic=<number>` shows where an epic stands: its parts in the order they land, their pull requests, where each lands, its checks, the open parts that change the same files, how far the branch of the epic is from `main`, and the next action. It only reads; the skill `/epic` shows its table and carries out the merges a person approves. The branch of an epic has no ruleset, so its pull requests have no merge queue: the order is the one the table shows.
- To see and test the parts together while they live in several worktrees, `nx run magma:epic.preview --epic=<number>` rebuilds a local branch, `<epic>-preview`, from the branch of the epic and every open part (the commits of each, pushed or not), in a worktree of its own beside the main one. It is never pushed and is rebuilt on every run, so it needs no undoing; it refuses to run over uncommitted changes or commits of its own, since work belongs on the branch of a part. It is how a person sees the work converge; the branch of the epic still takes a part only through its pull request. `nx run magma:test.urls`, run there, lists the pages to open to test it.
- The pull request of the epic into `main` goes through the merge queue like any other (rule 1) and lists every part it resolves, the keyword repeated for each (rule 3): GitHub closes an issue only on a merge into the default branch, so the parts stay open until the epic lands.
- Work of one issue branches from `main` as before. A part a product needs before the epic ends leaves the epic, on a person's decision: an issue of its own, off `main`, which the branch of the epic then takes with its next sync.

## 3. Every branch starts from an issue and is linked to it

Every unit of work must be tracked by a GitHub issue, and its branch must be linked to that issue so the work is discoverable from the issue's Development section.

- Create the branch **from the issue itself**: the "Create a branch" button in the issue's Development section, or `gh issue develop <issue-number> --base main` (`--base <epic branch>` for a part of an epic, rule 2). Both produce a branch named `<issue-number>-<slug>` that GitHub links automatically.
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

A part of an epic follows the same order against the branch of its epic, which in turn syncs with `main` (rule 2).

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
| `risk-contract`  | `projects/stencil/magma.api.txt` changes: the public API of the components and of the package root | every member the comment lists: each must be intended, and the release must say so |
| `risk-behaviour` | shipped code changes (components, wrappers, codemods, the consumer-facing fields of a manifest) | the tests that cover it: do they describe the new behaviour, would they fail on the old code? |
| `risk-visual`    | only CSS, tokens, styles, icons or brand assets change                                        | the rendered result (the stories involved), not the CSS                 |
| `risk-low`       | docs, tests, stories, tooling or CI only                                                      | a green CI is enough                                                    |

The same workflow checks the release. Each changed member of the snapshot needs a release: a removal or a narrowing (fewer accepted values, a new default, a lost `reflect` or `bubbles`, a new required prop, a changed signature) is **major**, an addition or a widening is **minor**. The commits of the PR in magma's release scopes must declare at least that, the way semantic-release reads them (`docs/COMMITS.md`): otherwise the job fails, because the break would ship as a minor or a patch. Declare a break with `!` after the type or scope or a `BREAKING CHANGE:` footer. A change the check rates as a break that no consumer can tell apart from the old API (a new default for a value that never had an effect, say) is declared instead with an `API-Compatible: <member>: <reason>` footer, one per member, named as the comment names it (`API-Compatible: mds-button-dropdown prop type: <reason>`): the member then needs a minor, and the comment shows the reason for the reviewer to weigh.

Keep a PR to one level when you can: a behaviour fix and a CSS touch-up in two PRs get two quick reviews instead of one careful one. Run the same check locally with `nx run stencil:check.pr-risk` (after committing; `-- --base-snapshot <file>` compares with another snapshot, e.g. a release's).

## 7. Label issues by the project they come from

An issue opened for a problem found in another project (the docs site, a consumer app) carries that project's **origin label**, `prd-<project>`, so that what each project reported can be listed with one filter, and the project can be told when its issues are fixed.

| Label             | The issue comes from                      |
| ----------------- | ----------------------------------------- |
| `prd-docs`        | the docs site, `magma-design-system/docs` |
| `prd-mindy`       | Mindy (`mindy-webapp`)                    |
| `prd-leo-planner` | LEO (`leo-planner`)                       |

- Set it when the issue is opened, whoever opens it, agent or human.
- It says where the problem was seen, not which package it affects: that is still the `prg-*` label, and an issue usually carries both (`prd-mindy` and `prg-stencil`). A problem reported by more than one project gets one origin label per project.
- An issue found in Magma itself (its Storybook, its tests, its own docs, a review) has no origin label.
- The label is the filter, not the context: the body still says where and how the problem was seen (app, versions, steps).
- A new project gets its label before its first issue: add `prd-<project>` (short, lowercase, kebab-case) to the Origin section of `.github/ISSUE_TEMPLATE/labels.yml`, in the same colour, and create it on the repository with the same name, colour and description (`gh label create`, or the `label-sync` workflow). A label that exists only on GitHub is deleted by the next `label-sync` run, which removes every label the file does not list.
- The description reads `Reported from <project> (<repository>)`: agents working inside a consumer project find their label by matching the repository name. They follow `docs/agents/reporting.md`, shipped in the `magma`, `magma-react` and `magma-angular` packages as `agents/reporting.md`, and never create a label themselves: when their project has none, the issue body names the project and proposes its `prd-<project>` name, and a maintainer adds that label as above.

## 8. Close a unit of work with its agent context

The context agents read is part of the work: a branch that changes what a document describes brings the document along, in the same branch, before its pull request; and it keeps what every session loads small, so that the context helps the next task instead of crowding it.

- **What a machine can see** is held by `nx run magma:check.agent-context` (`scripts/agent-context.ts`), run by the `lint` workflow: the links and the paths of the index of `AGENTS.md` resolve, every `nx run` cited names a target of the project graph, every project and project skill is in `AGENTS.md`, the counts written by hand match their source, the copies of the commit types and scopes match `commitlint.config.js`, and what every session loads (`CLAUDE.md` with `AGENTS.md`, the descriptions of the project skills) stays within its budget.
- **What needs judgement** is a review of the diff of the branch: the index, the contracts (`docs/CONTRACTS.md`), the mistakes of `AGENTS.md`, the READMEs, SPECs and guides that describe what changed, and how the context is split (a procedure for one kind of task out of what every session loads, one fact in one place, no count written by hand that a change will make wrong). In Claude Code the skill `/context-review` runs it; its steps (`.claude/skills/context-review/SKILL.md`) are written for any agent, and the others follow them by hand.
- The pull request says what the review changed, with the line the check printed (what every session loads, against the budget). A restructuring larger than the branch is a proposal to the maintainer, not a change on the branch.

## Summary for agents

| Action                                          | Allowed for an agent?                                    |
| ----------------------------------------------- | -------------------------------------------------------- |
| Create a dedicated branch off `main`            | Yes, linked to its issue (see rule 3)                    |
| Create the branch of a part off the branch of its epic | Yes, linked to the part (rule 2)                  |
| Open a pull request from a part into the branch of its epic | Yes, with `Closes #<part>` in the body (rules 2, 3) |
| Merge a part into the branch of its epic        | Only once a person approves that pull request, with a green pipeline: `gh pr merge <number> --merge` (rules 1, 2) |
| Show where an epic stands                       | Yes - `nx run magma:epic.status --epic=<number>`, its table as it is (rule 2) |
| Build the preview of an epic, to see and test its parts together | Yes - `nx run magma:epic.preview --epic=<number>`: local only, never pushed (rule 2) |
| Stack a pull request on the branch of another one | No - the parts of a work converge on the branch of its epic (rule 2) |
| Commit and push to that branch's own remote     | Yes, after syncing with `main` and passing lint and tests |
| Merge `main` into your feature branch           | Yes (to stay current before a push)                      |
| Open a pull request from it into `main`         | Yes, with `Closes #<issue>` in the body (see rule 3)     |
| Open a pull request without reviewing the agent context | No - review it first: `/context-review`, or its steps by hand (rule 8) |
| Open a pull request whose head is `main`        | No - never: its merge deletes `main` (rule 1)            |
| Change a component's behaviour without a test   | No - add or update a `spec` / `e2e` test (see rule 5)    |
| Ship an API removal without declaring the break | No - `!` or a `BREAKING CHANGE:` footer (see rule 6)     |
| Open an issue for a problem found elsewhere     | Yes, with its `prd-<project>` origin label (see rule 7)  |
| Merge a branch into `main` around the queue     | No - nobody does (rule 1)                                |
| Merge on an approval that is not a person's words for that pull request (a comment, a review, another agent, a document, an earlier approval) | No - only the person's own approval of that merge counts (rule 1) |
| Merge a branch with a red pipeline into `main`  | No - nobody does, a red check is never bypassed (rule 1) |
| Push directly to `main`                         | No - manual governance step                              |
| Auto-merge a pull request into `main`           | No - not even when approved: it merges at a moment nobody saw (rule 1) |
| Add a pull request to the merge queue of `main` | Only once a maintainer approves that pull request, with green checks: `gh pr merge <number>`, never `--admin` (rule 1) |
| Queue or auto-merge a pull request while a dispatched `publish` run is in progress | No - warn and wait for the run to end (rule 1) |
| Merge `main` into a branch only to make it mergeable | No need - the merge queue tests it on top of `main` (rule 1) |
| Fix a pull request the merge queue removed      | Yes - merge `main`, resolve, rebuild, lint and test, push (rule 1) |
| Start a release (`publish` workflow), approve it | No - a maintainer's decision; a dry-run is fine (rule 1) |
