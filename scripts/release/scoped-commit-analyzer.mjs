// Scope-aware wrapper of @semantic-release/commit-analyzer for the per-package
// releases of this monorepo.
//
// A commit counts for a package when at least one of its scopes matches one of
// the package's scope tokens. Scopes are split the way commitlint splits them
// (`/`, `\` or `,`), so `feat(design-tokens,styles): …` counts for both
// packages. A revert counts through the header it reverts. Commits without a
// scope (merges included) count for no package. The kept commits then go
// through the stock analyzer and its default rules (breaking -> major,
// feat -> minor, fix/perf -> patch).
//
// Options: `scope`, the '|'-separated scope tokens of the package (globs
// allowed, e.g. 'magma|stencil|mds-*'; empty = every commit counts), plus any
// @semantic-release/commit-analyzer option.
import micromatch from 'micromatch';
import { analyzeCommits as analyze } from '@semantic-release/commit-analyzer';

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

export async function analyzeCommits({ scope, ...pluginConfig }, context) {
  if (!scope) return analyze(pluginConfig, context);
  const commits = context.commits.filter(({ message }) => inScope(message, scope));
  context.logger.log(`${commits.length} of ${context.commits.length} commits in scope '${scope}'`);
  return analyze(pluginConfig, { ...context, commits });
}
