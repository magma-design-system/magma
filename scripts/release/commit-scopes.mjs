// Which packages a conventional commit counts for, read from its scopes.
// Shared by scoped-commit-analyzer.mjs (the release) and by
// projects/stencil/scripts/pr-risk.ts (the semver check on pull requests),
// so both read a commit the same way. Depends on micromatch only, which the
// workspace installs (the analyzer itself is installed by the release workflow).
//
// Scopes are split the way commitlint splits them (`/`, `\` or `,`), so
// `feat(design-tokens,styles): ...` counts for both packages. A revert counts
// through the header it reverts. Commits without a scope (merges included)
// count for no package.
import micromatch from 'micromatch';

const HEADER = /^\w+(?:\(([^)]*)\))?!?: /;
// `revert: <header>` (commitlint) or git's default `Revert "<header>"`
const REVERT = /^(?:revert: "?|Revert ")(.+?)"?$/;
const SCOPE_DELIMITERS = /\/|\\|, ?/;

export const commitScopes = (message) => {
  let header = message.split('\n', 1)[0].trim();
  const reverted = REVERT.exec(header);
  if (reverted) header = reverted[1];
  const scope = HEADER.exec(header)?.[1];
  return scope
    ? scope
        .split(SCOPE_DELIMITERS)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
};

export const inScope = (message, scope) =>
  commitScopes(message).some((s) => micromatch.isMatch(s, `@(${scope})`));
