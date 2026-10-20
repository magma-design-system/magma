---
applyTo: '**'
---

# Commit message format

Enforced by `commitlint.config.js` via the `.husky/commit-msg` hook:

- Format: `<type>(<scope>): <subject>`
- Allowed types: `build`, `change`, `chore`, `ci`, `docs`, `feat`, `fix`, `hotfix`, `merge`,
  `perf`, `refactor`, `revert`, `style`, `test`. Use the standard spellings **`docs`** and
  **`refactor`** (not `doc` / `refact`)
- Scope is **required**, except for `revert` which must have an empty scope. Use a project name
  (`codemod`, `design-tokens`, `icons`, `identity`, `lit`, `magma`, `magma-angular`,
  `magma-react`, `stencil`, `storybook`, `styles`, `svg-icons`) or a component directory name
  under `projects/stencil/src/components/` (`mds-button`, `mds-input`, …)
- `style` is rejected on the `styles`, `icons`, `identity`, `magma` and `svg-icons` scopes
- Subject in lowercase, imperative mood ("add" not "added"), no trailing period, max 72 chars

See [`docs/COMMITS.md`](../../docs/COMMITS.md) for full details and examples.
