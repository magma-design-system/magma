---
applyTo: '**'
---

# Commit message format

Enforced by `commitlint.config.js` via the `.husky/commit-msg` hook:

<!-- The two lists below copy commitlint.config.js; nx run magma:check.agent-context holds them to it. -->

- Format: `<type>(<scope>): <subject>`
- Allowed types: `build`, `change`, `chore`, `ci`, `docs`, `feat`, `fix`, `hotfix`, `merge`,
  `perf`, `refactor`, `revert`, `style`, `test`
- Use the standard spellings **`docs`** and **`refactor`** (not `doc` / `refact`)
- Scope is **required**, except for `revert`, which must have an empty scope: a project scope or
  a component directory name under `projects/stencil/src/components/` (`mds-button`,
  `mds-input`, ...)
- Project scopes: `claude-plugin`, `codemod`, `design-tokens`, `icons`, `identity`, `lint`,
  `lit`, `magma`, `magma-angular`, `magma-react`, `mcp`, `stencil`, `storybook`, `studio`,
  `styles`, `svg-icons`
- `style` is rejected on the `styles`, `icons`, `identity`, `magma` and `svg-icons` scopes
- Subject in lowercase, imperative mood ("add" not "added"), no trailing period, max 72 chars

See [`docs/COMMITS.md`](../../docs/COMMITS.md) for full details and examples.
