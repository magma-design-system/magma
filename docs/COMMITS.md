# Commit message convention

This document is the canonical reference for how to write commits in this repository. The format is enforced by [`commitlint.config.js`](../commitlint.config.js) via the [`.husky/commit-msg`](../.husky/commit-msg) hook, so any commit that does not follow these rules will be rejected.

## Format

```
type(scope): subject
```

- **`type`** - one of the 14 allowed values (see below). Lowercase.
- **`scope`** - required. One of the project names or a component directory name.
- **`subject`** - short, imperative ("add X", "fix Y", "update Z"). Lowercase first word, no trailing period.

A blank line followed by a longer body is supported but not required.

## Types

The full list is enforced by the `type-enum` rule in [`commitlint.config.js`](../commitlint.config.js). Several of these are **custom** and differ from the Conventional Commits defaults - pay attention to `refact` (not `refactor`) and `doc` (not `docs`).

| Type       | Use for                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------ |
| `build`    | Build system, bundler, or external dependency changes                                      |
| `change`   | Behaviour changes that are neither a feature nor a bug fix (e.g. deprecations, API tweaks) |
| `chore`    | Tooling, config, formatting, lint setup, maintenance that does not affect runtime          |
| `ci`       | CI/CD configuration only (e.g. `.gitlab-ci.yml`)                                           |
| `docs`     | Documentation only (markdown, JSDoc, READMEs). **Not** `doc`                               |
| `feat`     | New user-facing functionality                                                              |
| `fix`      | Bug fix                                                                                    |
| `hotfix`   | Urgent production fix on a release branch                                                  |
| `merge`    | Merge commits (typically auto-generated)                                                   |
| `perf`     | Performance improvement with no behavioural change                                         |
| `refactor` | Refacting with no behavioural or API change. **Not** `refact`                              |
| `revert`   | Revert of a previous commit. **Scope must be empty** (see special rules)                   |
| `style`    | Cosmetic CSS/visual changes only. Has scope restrictions (see special rules)               |
| `test`     | Test additions or changes only                                                             |

## Scopes

The scope is **required** for every commit (except `revert`). The allowed scopes are defined by the `custom-scope-enum` rule and fall into two categories:

### 1. Project scopes (static list)

```
design-tokens, icons, identity, lit, magma, react, stencil, storybook, styles, svg-icons
```

Use the project scope when the change touches the project as a whole or several components inside it.

### 2. Component scopes (dynamic list)

Every directory under [`projects/stencil/src/components/`](../projects/stencil/src/components) is automatically a valid scope. Examples: `mds-button`, `mds-input`, `mds-accordion`, `mds-card`, …

Use the component scope when the change is isolated to a single component.

> The component list is read dynamically at lint time, so any newly scaffolded `mds-*` directory becomes a valid scope without editing the config.

## Special rules

These are the non-obvious rules enforced by the custom plugin in `commitlint.config.js`. They override the defaults from `@commitlint/config-conventional`.

### Scope cannot be empty

Every commit must have a scope. `feat: add button` is **invalid** - use `feat(mds-button): add button`.

### `revert` must have empty scope

```
✅ revert: undo accidental token rename
🚫 revert(stencil): undo accidental token rename
```

### `style` is restricted

`style` is reserved for cosmetic CSS/visual changes. The plugin rejects:

- `style(styles): …` - use `fix(styles)` or `change(styles)` instead. The `styles` scope owns CSS code; `style` type would be ambiguous.
- `style(icons): …`, `style(identity): …`, `style(magma): …`, `style(svg-icons): …` - these projects do not contain CSS, so a `style` type makes no sense there.

If you are formatting code or changing lint rules, that is `chore`, not `style`.

## Examples

From recent history - these are the canonical shape and tone:

```
feat(mds-button): add notification slot
fix(mds-input): resolve eslint error
refact(stencil): lint syntax for CSS properties across multiple components
docs(stencil): improve formatting and clarify component usage documentation
chore(magma): update husky, lint and format on pre-commit
chore(stencil): replace require with import
chore(mds-button): update readme
```

### Invalid examples

```
🚫 feat: add new button             ← missing scope
🚫 refactor(stencil): tidy imports  ← "refact" is not allowed; use "refactor"
🚫 doc(stencil): fix typo          ← "doc" is not allowed; use "docs"
🚫 style(magma): format code        ← style type forbidden on magma scope; use "chore"
🚫 revert(stencil): undo X          ← revert must have empty scope
```

## Decision tree

When unsure which type to pick:

1. Does it add user-facing functionality? → **`feat`**
2. Does it fix a bug? → **`fix`** (or **`hotfix`** if it is an urgent prod patch on a release branch)
3. Is it documentation only? → **`docs`**
4. Is it tests only? → **`test`**
5. Is it a performance improvement with no behaviour change? → **`perf`**
6. Is it a refactor with no behaviour change? → **`refactor`**
7. Is it a cosmetic CSS change? → **`style`** (check scope restrictions above)
8. Is it build tooling or dependency changes? → **`build`**
9. Is it CI/CD configuration? → **`ci`**
10. Is it formatting, lint config, repo maintenance? → **`chore`**
11. Is it reverting a previous commit? → **`revert`** (no scope)
12. Otherwise a behaviour change that does not fit `feat` or `fix`? → **`change`**

When in doubt, run `git log --oneline -30` and follow the style of recent commits with a similar nature.

## For AI commit assistants

Before writing a commit message:

1. Identify the **scope** first. If only one component changed, use the component name (`mds-button`, `mds-input`, …). If multiple components in the same project changed, use the project scope (`stencil`, `styles`, …).
2. Pick the **type** using the decision tree above. Remember the custom spellings: `refact` (not `refactor`), `docs` (not `doc`).
3. Write the **subject** as a short imperative phrase, lowercase, no trailing period, ideally under 72 characters.
4. If the commit cannot fit the format, the hook will reject it - fix the message and create a **new commit** rather than amending blind.

The source of truth for everything in this document is [`commitlint.config.js`](../commitlint.config.js); if a rule here ever conflicts with the config, the config wins.
