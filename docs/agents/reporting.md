# Magma - reporting a problem

> Scope: you are working in a project that uses Magma and you hit a problem that is
> Magma's, not the project's: a component that misbehaves, a guide that is wrong, a
> missing token or utility, a packaging or install issue. This is how to report it to
> the Magma repository, `magma-design-system/magma`, labelled with the project it comes
> from, so the maintainers can tell which project reported what.

## 1. Make sure it is Magma's

- Read the component's `AGENTS.md` and `antipattern.md`, and
  [`anti-patterns.md`](anti-patterns.md): a documented mistake is the project's to fix,
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
labels of their repository. Open the issue without it and say in the body which project
and repository it comes from, so they can add the label.

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
