# Magma - reporting a problem

> Scope: you are working in a project that uses Magma and you hit a problem that is
> Magma's, not the project's: a component that misbehaves, a guide that is wrong, a
> missing token or utility, a packaging or install issue, something you needed that
> the Magma MCP server does not answer (section 7), or a component Magma lacks, which
> you propose with a prototype (section 8). This is how to report it to the
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
  filter or an argument it does not take;
- a flow across components that no pattern covers (`get_pattern` finds none for the need,
  or only a candidate, or its answer for your situation is a gap): the pattern is the
  missing answer, `magma-mcp: no pattern for <the need>`. Before you report it, find the
  components that hold the role (`find_component` with the need in words) and render them
  in your context; under "What the server answered" name each one and whether it fits. A
  component that holds the role but not as the flow needs is the first thing to fix, so say
  what does not fit (the render, the rule it breaks) instead of building around it. When none
  holds the role, the component is missing too: propose it in the same issue, under
  "Proposal", as section 8 says.

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

The tool, argument or field that would have answered it, if you have one in mind. For a
flow that needs a component Magma lacks, the proposal of that component and its
prototype (section 8).

## Versions

- @maggioli-design-system/magma: <installed version>
- Client: <e.g. Claude Code, VS Code, Cursor>

Found in <project> (<repository>).
```

## 8. A component Magma lacks

When no component of the installed Magma holds the role the task needs (a field, a target
to drop files on, a bar of actions), the component is the missing answer. Make sure first:
`find_component` with the need in words, `get_component` and `get_usage` for each one it
finds, and `render_preview` of it in the context of the flow (inside a card, a row, a
dialog). It is not a missing component when:

- a component holds the role, but not as the flow needs: that component is the one to fix
  (section 7, "What the server answered"); never propose a second one beside it;
- an existing, simpler way already meets the need: use it.

Magma keeps no proposal it has not seen: a new component is proposed with a prototype the
person has seen rendered, and corrected.

1. **The prototype.** Write what the flow needs with plain markup and the components Magma
   has, and mark the element that stands in for the new component with the tag you propose:
   `data-prototype="<the tag you propose>"` (`mds-` and a name for its role, such as
   `data-prototype="mds-preview"`). Never write the proposed tag itself: the page knows no
   such element. `render_preview` it in the context of the flow: its answer names the
   stand-in in `prototypes`, not as a problem. Show the person the image, say which part of
   it is the prototype, and render again with their corrections until they agree with it.
2. **The proposal.** What the component is for (its intent); why no component holds the
   role (the components you checked, and what their render showed); its API: the props with
   their values and default, the slots, the events; what it is built on (the components,
   tokens and behaviour of Magma it reuses); its accessibility (its role, its name, the
   keyboard).
3. **Ask.** Show the person the proposal with the image of the prototype, and open the
   issue only once they agree with both.

Follow steps 2, 3, 4 and 6, with `feature`, `prg-stencil` and the project's `prd-*` label.
When the component is what a flow no pattern covers needs (section 7), the proposal goes in
that issue, under "Proposal"; otherwise in an issue of its own. Title:
`<the tag you propose>: <what it does>`, e.g.
`mds-preview: the result of an editor, drawn at a width of its own`. Body:

```markdown
## Need

What the task needed, in one sentence, and the flow it is part of.

## Why no component holds the role

The components you checked, and what their render showed.

## Intent

What the component is for, and what it is not for.

## API

| Kind | Name | What |
| --- | --- | --- |
| prop | `<name>` | its values and its default |
| slot | `<name>` | what goes in it |
| event | `<name>` | when it fires, and its detail |

## Built on

The components, tokens and behaviour of Magma it reuses.

## Accessibility

Its role, how it is named, how it works with the keyboard.

## Prototype

The markup, the stand-in marked `data-prototype`, rendered with render_preview: the image
is attached below.

## Versions

- @maggioli-design-system/magma: <installed version>
- Client: <e.g. Claude Code, VS Code, Cursor>

## Workaround

What the project does meanwhile, if anything: the prototype in its own code, or a pattern
of its own.

Found in <project> (<repository>).
```

`gh` cannot attach an image: give the person the file of the image (`file` in the answer of
`render_preview`) to drop into the issue once it is open. Until the component ships, the
project's markup that stands in for it carries a comment that links the issue (step 6); once
the installed Magma has the component, `render_preview` reports the prototype
(`prototype-shipped`): write the component instead.
