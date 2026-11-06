/**
 * Programmatic entry point for the Magma codemods: v2 -> v3 by default, v1 -> v2
 * -> v3 with `from: 1` (`src/manifest/manifests.ts`).
 *
 * The CLI (`src/cli.ts`) is a thin wrapper around {@link runMigration}.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { convertPathToPattern, globby } from 'globby';
import {
  chainFrom,
  DEFAULT_FROM,
  type FromMajor,
  jumpName,
  supersededFlags,
} from './manifest/manifests.js';
import { type Manifest } from './manifest/schema.js';
import { unifiedDiff } from './report/diff.js';
import { Reporter } from './report/reporter.js';
import { type FileReport, type Finding, type Report, type Surface } from './report/types.js';
import { transformAngular } from './surfaces/angular.js';
import { transformCss } from './surfaces/css.js';
import { transformHtml } from './surfaces/html.js';
import { transformInlineTemplates } from './surfaces/inline-templates.js';
import { transformReact } from './surfaces/react.js';
import { type TransformContext, type TransformResult } from './surfaces/shared/transform.js';
import { type SemanticOptions } from './surfaces/shared/semantic-ops.js';

/**
 * The semantic utilities (`bg-surface-raised`) are `rgb(var(--magma-*))`: the
 * Tailwind bridge alone resolves them to an empty colour.
 */
export const SEMANTIC_CSS_NOTE =
  'semantic utility classes need the `--magma-*` layer: import `@maggioli-design-system/styles/dist/css/semantic.css` (the `--magma-*` values) next to `dist/tailwind/theme.css` (the utilities), or they paint no colour';

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
  /**
   * The major the code is on (default 2): 2 runs v2 -> v3, 1 runs v1 -> v2 then
   * v2 -> v3, each jump on what the previous one wrote.
   */
  from?: FromMajor;
  /** Override the bundled jumps with one manifest, a JSON file. */
  manifestPath?: string;
  /** Write the JSON report to this path. */
  reportPath?: string;
  /** Write the Markdown worklist (decisions by token, checklist per file) to this path. */
  reportMarkdownPath?: string;
  /** Category L: how far the semantic utility migration may write (default: report only). */
  semantic?: SemanticOptions;
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

// `.js` / `.mjs` / `.cjs`: JSX written in `.js` files, and the strings of a
// Tailwind 3 config or of code that builds a colour (category N reports them).
// `.astro`: a component of markup and `<style>`, read as HTML (its frontmatter is text).
const EXTENSIONS = ['html', 'htm', 'astro', 'tsx', 'jsx', 'ts', 'js', 'mjs', 'cjs', 'css', 'scss'];

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
      if (['.tsx', '.jsx', '.js', '.mjs', '.cjs'].includes(ext)) return react;
      if (ext === '.ts') return inline;
      if (ext === '.html' || ext === '.htm' || ext === '.astro') return html;
      return null;
  }
};

/**
 * The banner the design-tokens build writes at the top of its outputs
 * (`projects/design-tokens/src/formats/<format>/template.hbs`), which its CLI also
 * writes into a product (`magma-design-tokens --outDir`). Such a file is
 * regenerated with the design-tokens of the target major, never migrated by
 * hand: it is reported once and left as it is.
 */
const GENERATED_TOKENS =
  /^\s*\/\*[\s\S]*?@magma-design-system\/design-tokens v([\w.-]+)[\s\S]*?Do not edit directly[\s\S]*?\*\//;

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

const loadManifests = (options: MigrationOptions): Manifest[] =>
  options.manifestPath
    ? [JSON.parse(readFileSync(options.manifestPath, 'utf8')) as Manifest]
    : chainFrom(options.from ?? DEFAULT_FROM);

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
    // The directory is a literal path, not a pattern: escape it, or a Next.js
    // route group `(pages)` or a dynamic segment `[id]` matches nothing.
    if (isDir)
      patterns.push(`${convertPathToPattern(p.replace(/\/$/, ''))}/**/*.{${EXTENSIONS.join(',')}}`);
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
  const manifests = loadManifests(options);
  const first = manifests[0]!;
  const last = manifests[manifests.length - 1]!;
  const superseded = supersededFlags(manifests);

  if (write && options.force !== true) {
    const clean = isGitClean(cwd);
    if (clean === false) {
      throw new Error(
        'Refusing to --write: the git working tree is not clean. Commit/stash first, or pass --force.',
      );
    }
  }

  const reporter = new Reporter({
    fromVersion: first.fromVersion,
    toVersion: last.toVersion,
    jumps: manifests.map(jumpName),
    dryRun: !write,
  });
  const ctxBase = {
    only: options.only ? new Set(options.only) : undefined,
    skip: options.skip ? new Set(options.skip) : undefined,
    semantic: options.semantic,
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
    const generated = GENERATED_TOKENS.exec(source);
    if (generated) {
      reporter.addFile({
        file,
        surface: route.surface,
        changed: false,
        findings: [
          {
            kind: 'dynamic',
            surface: route.surface,
            file,
            line: 1,
            message: `generated by the design-tokens CLI (design-tokens ${generated[1]}): not migrated; regenerate it with the design-tokens of Magma ${last.toVersion.split('.')[0]}`,
          },
        ],
      });
      continue;
    }
    try {
      // Each jump reads what the previous one wrote; the file gets one diff,
      // from what it was to what the last jump left.
      let output = source;
      const findings: Finding[] = [];
      for (const manifest of manifests) {
        const result = route.run(output, manifest, { file, ...ctxBase });
        const jump = jumpName(manifest);
        for (const f of result.findings) {
          const moot = manifest !== last && f.kind === 'flag' && superseded.has(f.ruleId ?? '');
          if (!moot) findings.push({ ...f, jump });
        }
        if (result.changed) output = result.output;
      }
      const changed = output !== source;
      const fileReport: FileReport = {
        file,
        surface: route.surface,
        changed,
        findings,
        diff: changed ? unifiedDiff(file, source, output) : undefined,
      };
      reporter.addFile(fileReport);
      if (
        findings.some((f) => f.kind === 'change' && f.ruleId?.startsWith('global/classSemantic/'))
      )
        reporter.addNote(SEMANTIC_CSS_NOTE);
      if (write && changed) writeFileSync(file, output);
    } catch (error) {
      reporter.addError({ file, surface: route.surface, message: (error as Error).message });
    }
  }

  const report = reporter.build();
  if (options.reportPath) writeFileSync(options.reportPath, reporter.toJSON(report));
  if (options.reportMarkdownPath) {
    const target = resolve(cwd, options.reportMarkdownPath);
    writeFileSync(
      target,
      reporter.toMarkdown(
        report,
        dirname(target),
        cwd,
        manifests.find((m) => m.global.semanticClasses)?.global.semanticClasses?.thresholds,
      ),
    );
  }
  return { report, reporter };
};

export * from './report/types.js';
export { exitCode } from './report/reporter.js';
export type { Manifest } from './manifest/schema.js';
export type { FromMajor } from './manifest/manifests.js';
export type { SemanticOptions } from './surfaces/shared/semantic-ops.js';
