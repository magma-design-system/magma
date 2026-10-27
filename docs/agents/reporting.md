# Magma - reporting a problem

> Scope: you are working in a project that uses Magma and you hit a problem that is
> Magma's, not the project's: a component that misbehaves, a guide that is wrong, a
> missing token or utility, a packaging or install issue, or something you needed that
> the Magma MCP server does not answer (section 7). This is how to report it to the
> Magma repository, `magma-design-system/magma`, labelled with the project it comes
> from, so the maintainers can tell which project reported what.

## 1. Make sure it is Magma's

- Read the component's `AGENTS.md` and its own `mistakes.md`, and
  [`mistakes.md`](mistakes.md): a documented mistake is the project's to fix,
  not a Magma bug.
- Check that the installed `magma`, `styles` and `design-tokens` versions belong
  together (the ones a `magma` release depends on): mismatched versions break tokens
  and styles on their own.
- Reduce it to the smallest markup that still shows the problem, without the project's
  own CSS or wrappers when you can.

## 2. Look for an existing issue

```bash
gh issue list --repo magma-design-system/magma --state all --search "<component or keywords>"
```

If one already describes it, comment there with what is new (your versions, another
reproduction) and the project you hit it in, instead of opening a duplicate.

## 3. Ask before you open it

The Magma repository is public: opening an issue publishes its text. Draft the issue,
show it to the user, and create it only once they agree. Leave out anything private to
the project: internal URLs, credentials, customer data, unreleased features.

## 4. Pick the labels

Every issue carries three kinds of label:

| Label | Says | Values |
| ----- | ---- | ------ |
| type | what kind of issue | `bug`, `feature`, `docs` |
| `prg-*` | which Magma package is affected | `prg-stencil` (the components: `magma`, `magma-react`, `magma-angular`), `prg-styles`, `prg-design-tokens`, `prg-svg-icons`, `prg-icons`, `prg-identity` |
| `prd-*` | which project it was found in (its origin) | one per project, e.g. `prd-mindy` |

Find this project's origin label. Each one's description names the project and its
repository:

```bash
gh label list --repo magma-design-system/magma --search prd-
```

Match it against this project's repository name (the `origin` remote, or the `name` in
`package.json`). If none matches, do not create one: the Magma maintainers manage the
labels of their repository, and a label missing from their configuration is deleted by
the next sync. Open the issue without it, and propose its name in the body, so the
maintainers add it as it is: `prd-` and the project's short name, lowercase, in
kebab-case (`prd-mindy` for `mindy-webapp`, `prd-docs` for the docs site). Leave out
generic words such as `app`, `webapp`, `frontend` or the organization's name.

GitHub sets labels on a new issue only for users with write access to the repository,
and drops them for everyone else, often without an error. After creating the issue,
check what it got:

```bash
gh issue view <number> --repo magma-design-system/magma --json labels
```

If the labels were dropped, the `Found in` line of the body is what the maintainers
label it from.

## 5. Write it

In English. Title: `<component or package>: <what is wrong>`, e.g.
`mds-modal: the window jumps on open`. Body:

```markdown
## Problem

What happens, and what should happen instead.

## How to reproduce

The minimal markup or the steps, and the browser if it matters.

## Versions

- @maggioli-design-system/magma (or magma-react / magma-angular): <installed version>
- @maggioli-design-system/styles: <installed version>
- @maggioli-design-system/design-tokens: <installed version>
- Framework: <e.g. Next 16 + React 19, Angular 20, none>

## Workaround

What the project does meanwhile, if anything.

Found in <project> (<repository>): <where in the app>.
```

When step 4 found no origin label, end the body with the one you propose:

```markdown
No origin label for this project yet: proposed `prd-<name>`.
```

Read the installed versions from the lockfile or `npm ls`, not from the ranges in
`package.json`.

## 6. Create it

```bash
gh issue create --repo magma-design-system/magma \
  --title "mds-modal: the window jumps on open" \
  --label bug --label prg-stencil --label prd-<project> \
  --body-file magma-issue.md
```

Pass only labels that exist: `gh` refuses an unknown one. Without `gh`, give the user
the title, the labels and the body to open it by hand at
`https://github.com/magma-design-system/magma/issues/new`.

Then give the user the issue URL, and leave a comment in the project next to the
workaround that links it, so the workaround can go once the fix ships.

## 7. A tool or an answer the MCP server is missing

The tools of the Magma MCP server ([`mcp.md`](mcp.md)) are there so you never read the
installed files by hand or guess. When one of them could not give you what the task
needed, Magma wants to know: the next tool or field comes from these reports. It is a gap
when:

- no tool covers the question, and you answered it by reading Magma's files
  (`documentation.json`, the token data, the guides) or by guessing;
- a tool said Magma has nothing for a well-formed question: its answer carries `gap`, or
  its error says it does not know;
- a tool answered, but not with what the task needed: a field it does not return, a
  filter or an argument it does not take.

It is not a gap when the answer is right but not the one you hoped for, when your own
input was wrong (an unknown tag, a missing argument), or when the question is about the
project rather than Magma.

Tell the user when it happens, carry on with the task, and at the end propose one issue
per missing capability, gathered from the whole task. Follow steps 2, 3, 4 and 6 (look
for an existing issue, ask before opening it, the labels, create it), with `feature`,
`prg-stencil` (the server ships inside `magma`) and the project's `prd-*` label, and this
title and body instead of the ones of step 5. Title: `magma-mcp: <what is missing>`, e.g.
`magma-mcp: find_component cannot filter by category`. Body:

```markdown
## Need

What the task needed to know or to do, in one sentence.

## What the server answered

The tool you called and its arguments, and what it returned; or that no tool covers it.

## What I did instead

Read a file by hand, guessed, asked the user, and what it cost.

## Proposal

The tool, argument or field that would have answered it, if you have one in mind.

## Versions

- @maggioli-design-system/magma: <installed version>
- Client: <e.g. Claude Code, VS Code, Cursor>

Found in <project> (<repository>).
```
