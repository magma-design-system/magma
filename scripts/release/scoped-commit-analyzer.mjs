// Scope-aware wrapper of @semantic-release/commit-analyzer for the per-package
// releases of this monorepo.
//
// A commit counts for a package when at least one of its scopes matches one of
// the package's scope tokens (commit-scopes.mjs). The kept commits then go
// through the stock analyzer and its default rules (breaking -> major,
// feat -> minor, fix/perf -> patch).
//
// Options: `scope`, the '|'-separated scope tokens of the package (globs
// allowed, e.g. 'magma|stencil|mds-*'; empty = every commit counts), plus any
// @semantic-release/commit-analyzer option.
import { analyzeCommits as analyze } from '@semantic-release/commit-analyzer';
import { inScope } from './commit-scopes.mjs';

export { commitScopes, inScope } from './commit-scopes.mjs';

export async function analyzeCommits({ scope, ...pluginConfig }, context) {
  if (!scope) return analyze(pluginConfig, context);
  const commits = context.commits.filter(({ message }) => inScope(message, scope));
  context.logger.log(`${commits.length} of ${context.commits.length} commits in scope '${scope}'`);
  return analyze(pluginConfig, { ...context, commits });
}
