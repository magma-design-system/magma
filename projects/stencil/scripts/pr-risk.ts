/**
 * The review level of a pull request and the semver check of its public API change
 * (#843), from git alone: the files the branch changes, the magma.api.txt of its base and
 * of its head, and the commits it adds. The logic is in scripts/pr-risk-lib.ts.
 *
 * Prints a Markdown report (the CI posts it as a PR comment and sets the risk-* label from
 * the level) and exits 1 when the commits declare less than the API change needs, so a
 * breaking change cannot ship as a patch or a minor. The commits count when their scope is
 * one of magma's release scopes, read from .github/workflows/stencil.release.yml.
 *
 * Trusts the committed magma.api.txt: check.api-snapshot verifies it against the build.
 *
 * Run from the stencil package dir:  npm run check.pr-risk [-- options]
 *   --base <ref>            branch the PR targets (default origin/dev)
 *   --head <ref>            the PR (default HEAD)
 *   --base-snapshot <file>  compare with this snapshot instead of the base's, e.g. a release's
 *   --report <file>         also write the report there
 */
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PROJECT_DIR } from './meta';
import {
  apiChanges,
  declaredRelease,
  fileTier,
  manifestReachesConsumers,
  prTier,
  renderReport,
  requiredBump,
  semverOk,
} from './pr-risk-lib';
import { inScope } from '../../../scripts/release/commit-scopes.mjs';

const REPO = join(PROJECT_DIR, '../..');
const SNAPSHOT = 'projects/stencil/magma.api.txt';
const RELEASE_WORKFLOW = '.github/workflows/stencil.release.yml';

const option = (name: string, fallback?: string): string | undefined => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const git = (...args: string[]): string =>
  execFileSync('git', args, {
    cwd: REPO,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
const show = (ref: string, path: string): string | null => {
  try {
    return git('show', `${ref}:${path}`);
  } catch {
    return null;
  }
};

const head = option('head', 'HEAD') as string;
const base = git('merge-base', option('base', 'origin/dev') as string, head).trim();

const files = git('diff', '--name-only', base, head)
  .split('\n')
  .filter(Boolean)
  .map((path) => ({
    path,
    tier: fileTier(
      path,
      !path.endsWith('package.json') ||
        manifestReachesConsumers(show(base, path), show(head, path)),
    ),
  }));

const baseSnapshotFile = option('base-snapshot');
const before = baseSnapshotFile ? readFileSync(baseSnapshotFile, 'utf8') : show(base, SNAPSHOT);
const after = show(head, SNAPSHOT);
const changes = before != null && after != null ? apiChanges(before, after) : null;

const scope = /commit-scope:\s*(\S+)/.exec(readFileSync(join(REPO, RELEASE_WORKFLOW), 'utf8'))?.[1];
if (!scope) {
  console.error(`no commit-scope in ${RELEASE_WORKFLOW}`);
  process.exit(2);
}
const messages = git('log', '--no-merges', '--format=%B%x00', `${base}..${head}`)
  .split('\0')
  .map((m) => m.trim())
  .filter((m) => m && inScope(m, scope));

const { tier, because } = prTier(files, Boolean(changes?.length));
const required = changes ? requiredBump(changes) : null;
const declared = declaredRelease(messages);
const report = renderReport({ tier, because, changes, required, declared, scope });

process.stdout.write(report);
const reportFile = option('report');
if (reportFile) writeFileSync(reportFile, report);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `tier=${tier}\n`);
process.exit(changes && !semverOk(required, declared) ? 1 : 0);
