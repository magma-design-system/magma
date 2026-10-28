# Patterns

A pattern is the solution to a task that spans components and time: where a message goes,
when to ask before acting, what an empty, a waiting or a failed part shows. It is Magma's
default, the same in every product, so that the agents of the products ask for it
(`get_pattern`) instead of guessing. The method and the decisions behind it are recorded on
#1174 and in phase 5 of epic #1083; this file is how to write and change one.

## Where it lives

| What | Where |
| --- | --- |
| The patterns, one file each | `docs/agents/patterns/<id>.md`, written by the maintainers of Magma |
| What ships | `agents/patterns/<id>.md` and the catalogue `agents/patterns.md` in the three entry packages, written by `projects/stencil/scripts/sync-agent-docs.ts` before the build |
| Who reads them | the `get_pattern` tool of the MCP server, the `ui` and `review` skills of the Claude Code plugin, the agents of the products, the docs site |
| The format and its checks | `projects/lint/src/core/patterns.ts`, which ships inside `magma` |
| The template | `projects/stencil/template/pattern.md` |
| The contributor skills | `.claude/skills/pattern-new`, `pattern-change`, `pattern-list` (not in the plugin that ships) |
| A product layer | `magma/patterns/<id>.md` in the product's own repository |

## The method

- **The variables of the situation, never a domain.** A pattern is defined on the few questions
  that decide the case (for `message-placement`: what the message is about, its outcome, whether
  its place is on screen, now or later, whether a decision is needed, what an action changed).
  The rules of a business domain go in the layer of its product.
- **Situations every application has** (save a form in a dialog, delete an item from a list,
  copy a link, export a big file, lose the connection): they give the examples, the texts and
  the keywords.
- **The cases are data**, and the check proves them: every combination of the values falls in
  one case, in a declared gap, or in "not applicable" with its reason.
- **What the sources settle is written with its source; the rest is the maintainer's**, asked as
  a multiple-choice question with a recommended answer. Each answer is a row of `## Decisions`
  (date, decision, why): the history a successor reads before changing it.
- **Real products come later, as validation**: `validated-on` lists the products a default was
  checked on, empty at first.

## The format

A Markdown file: the frontmatter is the data, the body is for people and agents to read.

| Field | What it holds |
| --- | --- |
| `id` | Kebab-case, the file name. A contract: the products and their agents cite it. |
| `aliases` | The old ids after a rename. A reference to an alias fails the check; `get_pattern` resolves it. |
| `kind` | `pattern`; `block` is kept for the building blocks, which come from the patterns of the Data group. |
| `title`, `group`, `layer` | The group is one of `navigation`, `data`, `input`, `messages-and-states`, `ai` (the groups of the docs site); the layer is `magma`. |
| `status` | `candidate` (a need Magma knows, not defined: only `id`, `kind`, `title`, `group`, `layer`, `need`), `draft`, `decided` (no gaps left). |
| `need` | What the person must do or know, in one sentence, with no component in it. |
| `principle` | The rule of the pattern in one sentence: the bold line under the title. |
| `keywords`, `not-for`, `assumptions`, `high-stakes`, `components`, `related`, `validated-on` | The words of the need; the needs another pattern answers (`{ need, use: <id> }`); what the default takes for granted; whether it is a payment, a destructive action or a legal step; the components the cases use; the neighbouring patterns; the products it was validated on. |
| `variables` | `name: { values: [...], means: "..." }`. Values are text: quote `yes`, `no` and numbers. No variable may take the name of a key of the entries (`id`, `where`, `use`, `see`, `magma-gap`, `note`, `why`). |
| `cases` | `{ id, <variable>: <value>, where, use, see, magma-gap }`. A variable left out means any of its values, except `decision`, which means `none`; a list of values means any of them. `use` names components as `mds-tag attribute=value` (a bare attribute is a boolean, or a value of the application's); `see` names a case of the pattern or another pattern. |
| `gaps` | `{ <variable>: <value>, note }`: a combination still open, with its question. |
| `not-applicable` | `{ <variable>: <value>, why }`: a combination with no meaning. |
| `always-true` | `{ id, rule, checked-by: review or lint, lint, lint-planned, note }`: what holds in every product, which a product layer cannot change. A rule of another pattern is cited as `{ id, from: <pattern> }`. |
| `open-choices` | `{ id, default, may }`: what a product layer may narrow. |
| `situations` | `{ situation, case, note }`, or `{ situation, use: <pattern> }` when another pattern answers it. |

The body has the sections of the template, in this order: When to use it, What decides it,
Cases, Parts, Behaviour over time, Always true, Open choices, Situations, Accessibility,
Content, Magma gaps, Decisions. The title, the principle and the sections Cases, Always true,
Open choices and Situations are written from the frontmatter by the generator: edit the data,
never those sections. When to use it, What decides it and Decisions are required.

## The check

`nx run stencil:check.patterns`, in CI after the build (the `usage-docs` job of
`stencil.yml`):

- the format: every field, typed; every entry on the pattern's own variables;
- the cases: every combination in exactly one case, or in a gap or a not-applicable entry; two
  cases on one combination are a conflict, a gap or a not-applicable entry may overlap;
- the release: every component and attribute named exists in `dist/documentation.json`, with a
  value it takes;
- the lint: a rule `checked-by: lint` names a rule the lint has; a `lint-planned` one, a rule it
  does not have yet (once written, the check asks to switch it to `lint`);
- the links: every pattern, case and rule cited exists, never under an old id;
- the body: the sections in order, the generated ones up to date.

`check.usage-docs` reads the bodies too, with the rules of every agent guide.

## Product layers

A product keeps its layer in its own repository, in `magma/patterns/<id>.md`, with the same
shape: `id`, `extends: magma:<id>`, `layer: <product>`, `narrows` (values for the open
choices) and `situations` of its domain, mapped to the cases of the Magma pattern. A layer may
not narrow an "Always true" rule, nor a choice the pattern does not leave open, nor replace a
case: `get_pattern` applies a layer that holds to these rules and reports the one that does
not. A product may also write a pattern of its own (no `extends`, its own `layer`), never
under an id Magma has. `nx run stencil:check.patterns -- --layer <folder>` checks a layer.
A pattern that comes back in the layers of two or three products is proposed for the default.

## The commands

With Claude Code on this repository:

- `/pattern-new <the need>`: checks the list first, turns a candidate into a pattern or starts
  a new one, researches the sources, writes the file, runs the check, asks only the decisions
  the sources do not settle, opens the pull request;
- `/pattern-change <id>`: shows why the current answer was decided, asks whether the change is
  the default or one product's layer, keeps the old id on a rename;
- `/pattern-list`: the list, read only.

Without Claude:

```bash
nx run stencil:generate.pattern <id> --group <group> --need "<the need>"  # a draft from the template
nx run stencil:generate.pattern -- --sync     # the generated parts, from the frontmatter
nx run stencil:check.patterns                 # after nx run stencil:build
nx run stencil:list.patterns -- --status candidate
```

## Changing one

- An id is a contract: a rename keeps the old id in `aliases`.
- `pr-risk` sets the review level to contract when an "Always true" rule is added, changed or
  removed, when a pattern goes, and when a case or an open choice goes, since a product layer
  may cite them. It asks for no release of its own: no product layer exists yet that a removal
  would break.
- Every change adds a row to `## Decisions`.
- A pattern ships with the next release of `magma`: a commit `feat(magma): ...` for a new
  pattern or rule, `fix(magma): ...` for a wrong one.
