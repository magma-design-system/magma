/**
 * Programmatic entry point for the Magma v1 → v2 codemods.
 *
 * The CLI (`src/cli.ts`) is a thin wrapper around {@link runMigration}.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname } from 'node:path';
import { globby } from 'globby';
import { manifest as bundledManifest } from './manifest/manifest.js';
import { type Manifest } from './manifest/schema.js';
import { unifiedDiff } from './report/diff.js';
import { Reporter } from './report/reporter.js';
import { type FileReport, type Report, type Surface } from './report/types.js';
import { transformAngular } from './surfaces/angular.js';
import { transformCss } from './surfaces/css.js';
import { transformHtml } from './surfaces/html.js';
import { transformInlineTemplates } from './surfaces/inline-templates.js';
import { transformReact } from './surfaces/react.js';
import { type TransformContext, type TransformResult } from './surfaces/shared/transform.js';

export type Framework = 'react' | 'angular' | 'html' | 'css' | 'auto';

export interface MigrationOptions {
  /** Files and/or directories to scan. */
  paths: string[];
  framework: Framework;
  /** Apply changes in place. Default: dry-run. */
  write?: boolean;
  /** Allow `write` on a dirty git working tree. */
  force?: boolean;
  /** Extra ignore globs (added to the defaults). */
  ignore?: string[];
  only?: string[];
  skip?: string[];
  /** Override the bundled manifest with a JSON file. */
  manifestPath?: string;
  /** Write the JSON report to this path. */
  reportPath?: string;
  cwd?: string;
}

export interface MigrationRun {
  report: Report;
  reporter: Reporter;
}

const DEFAULT_IGNORE = [
  '**/node_modules/**',
  '**/dist/**',
  '**/.git/**',
  '**/build/**',
  '**/.next/**',
  '**/coverage/**',
];

const EXTENSIONS = ['html', 'htm', 'tsx', 'jsx', 'ts', 'css', 'scss'];

interface Route {
  surface: Surface;
  run: (source: string, manifest: Manifest, ctx: TransformContext) => TransformResult;
}

/** Pick the transform for a file given the framework (or `auto` by extension). Returns null to skip. */
export const routeFile = (file: string, framework: Framework): Route | null => {
  const ext = extname(file).toLowerCase();
  const css: Route = {
    surface: 'css',
    run: (s, m, c) => transformCss(s, m, c, { scss: ext === '.scss' }),
  };
  const react: Route = { surface: 'react', run: transformReact };
  const html: Route = { surface: 'html', run: transformHtml };
  const angular: Route = { surface: 'angular', run: transformAngular };
  const inline: Route = { surface: 'angular', run: transformInlineTemplates };

  switch (framework) {
    case 'css':
      return css;
    case 'react':
      return react;
    case 'html':
      return html;
    case 'angular':
      if (ext === '.html' || ext === '.htm') return angular;
      if (ext === '.ts') return inline;
      return null;
    case 'auto':
    default:
      if (ext === '.css' || ext === '.scss') return css;
      if (ext === '.tsx' || ext === '.jsx') return react;
      if (ext === '.ts') return inline;
      if (ext === '.html' || ext === '.htm') return html;
      return null;
  }
};

const isGitClean = (cwd: string): boolean | 'not-a-repo' => {
  try {
    const out = execFileSync('git', ['status', '--porcelain'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return out.trim() === '';
  } catch {
    return 'not-a-repo';
  }
};

const loadManifest = (manifestPath?: string): Manifest =>
  manifestPath ? (JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest) : bundledManifest;

/** Expand the input paths into a concrete, de-duplicated file list. */
export const collectFiles = async (
  paths: string[],
  cwd: string,
  ignore: string[],
): Promise<string[]> => {
  const files = new Set<string>();
  const patterns: string[] = [];
  for (const p of paths) {
    let isDir = false;
    try {
      isDir = statSync(p).isDirectory();
    } catch {
      continue;
    }
    if (isDir) patterns.push(`${p.replace(/\/$/, '')}/**/*.{${EXTENSIONS.join(',')}}`);
    else files.add(p);
  }
  if (patterns.length) {
    const matched = await globby(patterns, {
      cwd,
      absolute: true,
      onlyFiles: true,
      ignore: [...DEFAULT_IGNORE, ...ignore],
    });
    for (const m of matched) files.add(m);
  }
  return [...files].sort();
};

export const runMigration = async (options: MigrationOptions): Promise<MigrationRun> => {
  const cwd = options.cwd ?? process.cwd();
  const write = options.write === true;
  const manifest = loadManifest(options.manifestPath);

  if (write && options.force !== true) {
    const clean = isGitClean(cwd);
    if (clean === false) {
      throw new Error(
        'Refusing to --write: the git working tree is not clean. Commit/stash first, or pass --force.',
      );
    }
  }

  const reporter = new Reporter({
    fromVersion: manifest.fromVersion,
    toVersion: manifest.toVersion,
    dryRun: !write,
  });
  const ctxBase = {
    only: options.only ? new Set(options.only) : undefined,
    skip: options.skip ? new Set(options.skip) : undefined,
  };

  const files = await collectFiles(options.paths, cwd, options.ignore ?? []);

  for (const file of files) {
    const route = routeFile(file, options.framework);
    if (!route) continue;
    let source: string;
    try {
      source = readFileSync(file, 'utf8');
    } catch (error) {
      reporter.addError({
        file,
        surface: route.surface,
        message: `cannot read file: ${(error as Error).message}`,
      });
      continue;
    }
    try {
      const result = route.run(source, manifest, { file, ...ctxBase });
      const fileReport: FileReport = {
        file,
        surface: route.surface,
        changed: result.changed,
        findings: result.findings,
        diff: result.changed ? unifiedDiff(file, source, result.output) : undefined,
      };
      reporter.addFile(fileReport);
      if (write && result.changed) writeFileSync(file, result.output);
    } catch (error) {
      reporter.addError({ file, surface: route.surface, message: (error as Error).message });
    }
  }

  const report = reporter.build();
  if (options.reportPath) writeFileSync(options.reportPath, reporter.toJSON(report));
  return { report, reporter };
};

export * from './report/types.js';
export { exitCode } from './report/reporter.js';
export type { Manifest } from './manifest/schema.js';
