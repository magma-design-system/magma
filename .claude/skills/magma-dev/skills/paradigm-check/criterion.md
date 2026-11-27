# The paradigm check: criterion v3

How a judge decides whether an issue or a pull request opened by someone outside the maintainers
fits Magma, and in which form. Written only from what Magma states: every point names its
source. Where a judgment needs something no source states, the judge says so (a gap) instead of
filling it in.

This file is the one place the criterion lives, and it learns from every round: the
maintainer's decisions and disagreements are written back here, and into [cases.md](cases.md),
by step 7 of [SKILL.md](SKILL.md). The version in the title is the newest entry of "History", at
the end, which says what each version changed and why.

## Where to read

The repository at `origin/main`, in the detached worktree the skill gives (step 1 of
[SKILL.md](SKILL.md)), never another checkout: others may be days behind. GitHub data (`gh issue
view`, `gh pr view`, `gh issue list`, `gh pr list`) is live.

Reproducing means reading the source at `origin/main`; nothing is rendered. Where a verdict
depends on what a render would show, say so and lower the confidence; a CI artifact or a render
the thread links counts as a render.

## The scales

The values are written as the page stores them, in Italian; `check.agent-context` holds them
equal to the menus of [page.html](page.html).

### Issues

An issue answers "do we take it, and in which form?":

| Vote | When |
|---|---|
| Accoglibile | The need and the form proposed serve the purpose of the component and keep to Magma's rules |
| Altra forma | The need is real, the form is not: say which form (the component changed another way, another component, a new one, a pattern), and whether it exists only as a plan (an open issue or epic: "waits on #691"). When the right carrier is one of several candidates no source chooses, it is still Altra forma: name the candidates in `options`, the recommended one first |
| Già possibile | A documented way already meets the need: point to it |
| Contro una regola | A decided rule excludes it, and the request would break the reason of that rule: name the rule, its source and its reason. Only the maintainer can reopen it, for every product |
| Non di Magma | An error in the product's usage, or a problem of another project |
| Da decidere | The written sources do not settle it: say which decision is missing and what each answer implies, as `options` |

### Pull requests

A pull request answers "is it ready for the maintainer's review?":

| Vote | When |
|---|---|
| Pronta | Linked to its issue, with tests, docs and green checks, in the right form |
| Da sistemare | The right form, something missing: say what |
| Non conforme | The wrong form |
| Da decidere | As for an issue |

### Requests

An item that carries several requests, in its body or in a comment, gets one vote per request.
A request whose vote depends on another takes the vote that follows the recommended answer of
the other, and says in `after` what changes with the other answer.

## Issue: the points

1. **Is it Magma's?** A behaviour contrary to the component's docs, the standards or the
   platform, not a misreading of the docs or an error of the product. Source:
   `docs/agents/reporting.md`, step 1.
2. **Is there already a way?** A documented prop, slot, part, public custom property, pattern or
   block that meets the need. Two ways to do one thing are a defect, not a choice to offer.
   Source: `.claude/skills/magma-dev/skills/pattern-new/SKILL.md`, step 2, point 3 ("one way only");
   `docs/PATTERNS.md`, "The method".
   Some pairs are deliberate and are no second way:
   - the `label` prop and the default slot of a component, "a convenience"
     (`projects/stencil/SPEC.md`, Authoring rules, Props);
   - styling through the public custom properties and the documented parts
     (`docs/agents/conventions.md`, "Styling components from outside").
   Whether plain CSS on a component's host (a `padding`, a `box-shadow`) is a supported styling
   is written nowhere: a verdict that depends on it says so as a gap.
3. **The purpose test (written).** The decisive test for which component a request belongs to.
   - The purpose of the component: its whole `usage/1. Description.md`, which opens with the
     purpose (`projects/stencil/SPEC.md`, usage docs), its documented props, slots and parts,
     and its line in `docs/COMPONENTS.md`. A line that says what the component is not, or what
     to use instead, counts first. A size word ("compact") limits a request only where the
     Description says what it limits.
   - The purpose of the request: what the asked feature does for the person, in one phrase,
     from the case the issue describes (starts an action; says a state; lays out content; picks
     a value; shows who or what something is).
   - Does the feature serve the component's purpose? Yes: go on with the form. No: name the
     component whose stated purpose it is, or say that none has it (a new component).
   - The signals that a request would bend a component out of its shape (`pattern-new` step 2,
     point 3, "holding it would bend the one that exists"):
     a. free content where the component has a typed API (a slot for any markup beside a prop
        with values);
     b. the job another component's purpose states;
     c. an axis foreign to the purpose (a mark of identity on an action control);
     d. an option that serves the case of one product only.
   - If the purpose is too generic to decide (it would accept almost anything), say so, give Da
     decidere, and propose the sharper sentence for the maintainer to approve.
4. **The context test (derived from the code, never assumed).** Collect where Magma already
   places the component, citing each place:
   - the cases of the patterns in `docs/agents/patterns/` that name it, in their `use` or text;
   - its own `usage/2. Examples.md`;
   - the components that take it in a slot (their `@slot` JSDoc and usage docs).
   Then compare with the context the issue describes. A placement Magma has supports the purpose
   test; a new placement is a signal to report. Two kinds are neither:
   - a placement an open issue or epic plans (#1272 put suggestions on `mds-chip`): report it as
     planned, with its number; it supports the purpose test only if the plan agrees with the
     component's purpose, and it never counts as existing;
   - new content in a placement that exists (markup in a column header, a search in the slot of
     the brand): compare with what the `@slot` says the slot takes; content it does not name is
     a new placement.
   When the two tests agree, the verdict follows them; when they disagree, give Da decidere with
   both tests side by side.
5. **Planned or decided elsewhere?** Search, with the words of the need:
   - the open issues and epics (`gh issue list --state open --search "<words>"`; an epic has
     sub-issues: `--search "has:sub-issue"`);
   - the closed issues and the merged pull requests (`--state closed`, `gh pr list --state
     merged --search "<words>"`): on #1380 the decisive fact was a closed issue, #1469;
   - the skills of the repository (`.claude/skills/`), which may already do the job;
   - duplicates, and the origin label (`prd-*`, `docs/WORKFLOW.md` rule 7);
   - the decisions below.
   A planned carrier makes the verdict Altra forma, naming it.
6. **Where does the solution live?** In the web component, so every target gets it through the
   generated wrappers; a fix only in one wrapper or in a product recipe is suspect unless the
   problem is the wrapper's. Source: `docs/ARCHITECTURE.md`.
7. **Is the public surface right?** `projects/stencil/SPEC.md` (Styling API, the design
   decisions on `:host`), `AGENTS.md` ("Mistakes agents make here"),
   `docs/agents/conventions.md`, `docs/agents/color.md`: styling through public custom
   properties and documented parts; colours from roles, lengths from tokens; no hand-written dark
   mode.
8. **A product's design decision is a public custom property, not a ban.** When a product needs
   a design decision of a component (a shadow, a colour, a radius, a size) and no role, theme or
   prop gives it, the form is a public custom property on `:host` with the token as its default
   (`projects/stencil/SPEC.md`, Styling API: "Mark one public only when a product needs it and
   no role, theme or prop gives it"; "The design decisions on `:host`", #1499), with the
   accessibility refinements (the high-contrast ring, the focus) kept outside the value the
   product sets. A shared look across products is the default, not a prohibition: without a
   supported knob the product overrides the host anyway, and loses those refinements. Contro una
   regola is only for a rule whose reason the knob would break, named. Source: #1485, reversed on
   2026-11-25 to a public `--mds-header-bar-shadow`.
9. **A behaviour default.** A request to change a documented behaviour that no API change shows
   (dictation that replaces the text, initials that pick the colour). No written rule says when a
   default may change for every product, nor its release level: `docs/WORKFLOW.md` rule 6
   measures only `magma.api.txt`. The decisions so far kept the default and added an opt-in
   boolean (#1482 `disable-auto-variant`, #1519 `mic-insert`): propose that form first, and give
   the change of the default as the other option, naming what it would change, silently, in every
   product.
10. **Today's standards**: the design language (`docs/agents/patterns/`), the colour roles,
    accessibility. Source: `pattern-new`, step 2, point 2.
11. **Not a component.** For docs, packaging or planning items, points 3 and 4 do not apply:
    check instead whether the proposed text, export or plan is right against the code. On
    2026-11-25 the proposals' own errors were found there: an example that registered no
    children (#1539), two options that missed the cause (#1540).

## Decisions recorded on issues

Taken by the maintainer in the replies sent on these issues, each with its issue. They hold until
the docs take them in; then drop the line here, since the source wins. Check that each is still
current: read the later comments of its issue. Step 7 of [SKILL.md](SKILL.md) adds the decisions
of each round.

- `mds-button` is an action control: a mark or an avatar beside its label is not its job. A
  list of records with the open one beside it is the list-and-detail case of #1262 (#1518).
- `mds-chip` stands for a piece of metadata of a record (a tag, a status, the value of a filter),
  and its interactions act on that metadata: they switch a filter, or open the content around
  it. A suggestion or a command of the application is an `mds-button` (#1516; the docs in #1544).
- A value that matches no option: the field keeps it, selects the option once it appears, and
  does not submit it meanwhile (#1537).
- An application search in the bar goes in a dedicated `search` slot of `mds-header-bar`; the
  `logo` area stays the product's (#1483).
- Figma: one self-contained file per major (#1083, Decisions).
- A documented behaviour default stays, and an opt-in boolean gives the other behaviour:
  `disable-auto-variant` on `mds-avatar` (#1482), `mic-insert` on `mds-input` (#1519).
- The shadow of `mds-header-bar` is a public custom property, `--mds-header-bar-shadow`, the
  high-contrast ring outside it (#1485).

## Pull request

1. **Linked**: `Closes #n` in the body. A branch on a fork cannot be created from the issue, so
   the keyword is enough there; `Refs #n` is right when the issue is split across two pull
   requests. Source: `docs/WORKFLOW.md` rule 3.
2. **Does what the issue asks, and no more**, in the form the issue was judged to need: apply the
   issue points to the change. An issue not judged yet is judged in the same batch.
3. **Tests** for every behaviour change; pure style changes are exempt. `docs/WORKFLOW.md`
   rule 5.
4. **Docs and generated files**: `usage/*.md` and JSDoc updated; generated files never edited by
   hand; the API snapshot rebuilt when the API changes.
5. **Commits** per `docs/COMMITS.md`.
6. **Checks** green (`gh pr checks`). The workflows of a fork wait for a maintainer's approval:
   say "not run", not red.
7. **The thread**: judge the head commit; a review already in the thread counts, so say what it
   asked and whether the commits since do it.
8. **Built UI**: judged on its render (`v2:design-audit`), not run here: "not verifiable without
   the render".

## Output per item

The judge's report, in English, one block per item:

```
### #<n> <title as on GitHub>
- Kind: issue | pull request; bug | feature | docs | other; <the requests, numbered, if several>
- Purpose test: <component purpose, quoted with its source> / <request purpose> / <served or not>
- Context test: <where Magma places the component, cited> / <the issue's context> / <same, planned or new>
- Verdict: <one of the scale per request>
- Why: <2-4 sentences per request>
- Options: <for Da decidere or Altra forma with candidates: a, b, c, the recommended one first>
- Decisions relied on: <the decisions above, by issue; "none" if none>
- Sources used: <files and lines, with the point>
- Files: <the paths of the repository the verdict stands on, for the next run's staleness check>
- Gaps: <what the judgment needed that no source states; "none" if none>
- Confidence: high | medium | low
```

## Writing for the page

The maintainer reads the page quickly, often from a phone: each card must stand alone, without
the issue open beside it. In Italian:

- `title`: the title as written on GitHub.
- `summary`: who hits what, and why it matters, in one or two plain sentences, with no technical
  detail.
- For each request:
  - `ask`: the request as a full, concrete sentence of its purpose;
  - `plain` ("La questione"): the point in one or two plain sentences ("la correzione non
    funziona con le select"), never the code flow retold in words;
  - `example`: the markup of a technical case (`<mds-input-select value="x">` without its
    `<option value="x">`), before the prose, so the case is seen, not reconstructed;
  - `why`: the technical details, with the exact terms (`value = 'x'`, `valueMissing`);
  - `options`: the alternatives, one per entry (the page letters them), never "(a) ... (b)" in
    one paragraph, which reads as one argument;
  - `after`: what follows, or what changes if a request it depends on goes the other way.
- Plain is for the purpose only. A vague plain phrase is worse than an exact technical term: the
  exact terms go below, in `why`.
- Never a reference that needs another text ("le prime due", "come sopra"), never a code-level
  label as the only description.
- An issue and the pull request that fixes it point at each other (`related`): "Correzione
  proposta: PR #1508" on the issue, "Corregge la issue: #1503" on the pull request.

## Writing the replies

To the contributor, in English, from the final vote of each request and the maintainer's note,
in the voice of the maintainers ("we"), as the 19 replies of 2026-11-25:

- Open with thanks, then the answer in plain words; the technical details after it.
- One request: a short reply. Several: a numbered list in the order of the issue, each point
  opening with a short bold title of the request.
- Alternatives lettered (`a)`, `b)`), the recommended one first and said so.
- What we will do, as "we'll add", without a date; what the contributor can do (open a separate
  issue, change the pull request), asked plainly.
- Point to what answers: the documented way, the issue that plans it, the pull request that
  fixes it.
- Code, props and markup in backticks or a fenced block, exact.
- A reply that corrects an earlier one says so first ("A correction to our previous reply").
- A review lists what is missing before it can go in, and what is already good.
- Never a word about the page, the votes, the check or the agent.

## History

Newest first. Each version says what changed, why, and the issues or cases that showed it; the
title of this file names the newest.

### v3 (2026-11-26)

The gaps the trial of 2026-11-25 found, and its first round of votes (#1546; the cases of that
round are in [cases.md](cases.md)):

- the purpose test reads the whole Description and the documented API, and names the four
  signals of a request that would bend a component (#1516: the chip's clickable action was only
  in its second sentence);
- the context test weighs a placement an open epic plans, and new content in a placement that
  exists (#1272, #1483, #1538);
- closed issues, merged pull requests and the skills of the repository are sources (#1380:
  the decisive fact was a closed issue, #1469);
- a rule for behaviour defaults: keep the default, add an opt-in (#1482, #1519);
- the scale takes "Altra forma" with candidate carriers, and a request whose vote depends on
  another (#1518, #1516);
- the deliberate pairs that are no second way (the `label` prop and the default slot);
- a product's design decision is a public custom property, not a ban (#1485, reversed by the
  maintainer from Contro una regola);
- the decisions recorded on the issues, until the docs take them in;
- pull requests from forks, and the reviews already in a thread;
- for docs, packaging and planning, the proposed text checked against the code (#1539, #1540).

### v2 (2026-11-25)

The purpose test (the component's written purpose against what the request does for the person)
and the context test (where the code already places the component). Rerun blind on the seven
issues v1 left to decide: #1518 became Altra forma (identity is `mds-entity`'s purpose, not a
slot of `mds-button`), as the maintainer saw it; #1538 Accoglibile; #1537, #1516 and #1380 split
per request; #1483 and #1519 reduced to one yes-or-no question each.

### v1 (2026-11-25)

The first written criterion, only from Magma's sources, tried by five blind judges on the 22 open
items of contributors (19 issues, 3 pull requests). Facts and the flaws of the proposals were
found reliably (#1537, #1539, #1540, PR #1508); 7 issues of 19 were left to decide, almost all
on which of two components holds a role, a boundary no document wrote. The judges read a
checkout 55 commits behind `origin/main`: since then they read a fresh one.
