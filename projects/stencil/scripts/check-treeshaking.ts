/**
 * Guard against tree-shaking regressions in the three published packages
 * (magma, magma-react, magma-angular).
 *
 * With 114 components, an app that imports three of them must not ship all 114.
 * The properties that make that work are easy to break by accident - a stray
 * module-level side effect, a dropped `sideEffects` field, an output target
 * losing `esModules` - and the damage is invisible until someone measures a
 * consumer bundle. This script measures it.
 *
 * Two layers of checks:
 *
 * 1. Structural assertions - deterministic, no bundler involved. They pin the
 *    invariants documented in SPEC.md ("Public entry points").
 * 2. Consumer bundle sizes - for magma and magma-react, esbuild bundles a
 *    fixture importing ONE component and one importing the whole barrel, then
 *    checks both an absolute budget and the single/full ratio.
 *
 * Angular is measured differently, through a real `ng build` of
 * `angular/treeshaking-probe`. esbuild alone reports ~100% of the library for a
 * single component and would be pure noise: the Angular CLI runs a Babel pass
 * that marks the `__decorate` calls emitted for `@ProxyCmp` as pure and elides
 * `ɵɵngDeclareClassMetadata`, and without it every proxy in the FESM looks
 * side-effectful. The probe build is checked for size and, more precisely, for
 * the absence of components it never imported.
 *
 * Run from the stencil package dir, after building all three packages:
 *   npm run check.treeshaking
 */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { build } from 'esbuild';
import { COMPONENTS_DIR, DIST_DIR, DIST_REACT_DIR, PROJECT_DIR } from './meta';

const WORKSPACE_ROOT = path.resolve(PROJECT_DIR, '../..');
const ANGULAR_DIR = path.resolve(PROJECT_DIR, 'angular');
const ANGULAR_DIST_DIR = path.join(ANGULAR_DIR, 'dist/magma-angular');
const ANGULAR_PROBE_OUT_DIR = path.join(ANGULAR_DIR, 'dist/treeshaking-probe/browser');
const TMP_DIR = path.resolve(PROJECT_DIR, '.build/treeshaking');

/**
 * Budgets, in kB, for a build containing exactly one component (mds-button).
 * They include the fixed cost every consumer pays once - the ~58 kB Stencil
 * client runtime, mds-button's own children (mds-text, mds-icon, mds-spinner)
 * and, for the Angular probe, the Angular framework itself - so the marginal
 * cost of the next component is far lower.
 *
 * Measured on the first green run (magma 125 kB, magma-react 126 kB,
 * magma-angular 229 kB) and left ~20% of headroom: these are regression
 * tripwires, not targets to optimise against. When a component legitimately
 * grows, re-measure and move the number in the same commit.
 */
const BUDGET_KB = {
  magma: 150,
  'magma-react': 155,
  'magma-angular': 275,
};

/** A single component must stay well under the full barrel. */
const MAX_SINGLE_TO_FULL_RATIO = 0.25;

/**
 * Components the Angular probe never imports, directly or as a child of
 * mds-button. Finding any of their tags in the probe output means the whole
 * library came along for the ride.
 */
const TAGS_ABSENT_FROM_PROBE = [
  'mds-badge',
  'mds-calendar',
  'mds-radial-menu',
  'mds-table',
  'mds-tooltip',
];

const failures: string[] = [];
const notes: string[] = [];

const fail = (message: string): void => {
  failures.push(message);
};

const readJson = (file: string): Record<string, unknown> =>
  JSON.parse(fs.readFileSync(file, 'utf8'));

const requireBuilt = (dir: string, hint: string): boolean => {
  if (fs.existsSync(dir)) {
    return true;
  }
  fail(`missing build output ${path.relative(WORKSPACE_ROOT, dir)} - run \`${hint}\` first`);
  return false;
};

// ---------------------------------------------------------------------------
// 1. Structural assertions
// ---------------------------------------------------------------------------

const componentTags = fs
  .readdirSync(COMPONENTS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const checkStructure = (): void => {
  // `sideEffects` is what lets a bundler drop an untouched module wholesale.
  // magma keeps CSS listed: consumers may import stylesheets from dist/.
  const magmaPkg = readJson(path.resolve(PROJECT_DIR, 'package.json'));
  if (!Array.isArray(magmaPkg.sideEffects) || !magmaPkg.sideEffects.includes('**/*.css')) {
    fail('magma/package.json: expected "sideEffects": ["**/*.css"]');
  }

  const reactPkg = readJson(path.resolve(PROJECT_DIR, 'react/package.json'));
  if (reactPkg.sideEffects !== false) {
    fail('magma-react/package.json: expected "sideEffects": false');
  }

  const angularPkg = readJson(path.resolve(PROJECT_DIR, 'angular/magma-angular/package.json'));
  if (angularPkg.sideEffects !== false) {
    fail('magma-angular/package.json: expected "sideEffects": false');
  }

  // The custom-elements barrel must re-export the components themselves
  // (customElementsExportBehavior: 'single-export-module'), otherwise
  // `magma/components` resolves to an entry point that exposes nothing.
  const barrel = path.join(DIST_DIR, 'components/index.js');
  if (requireBuilt(barrel, 'nx run stencil:build')) {
    const source = fs.readFileSync(barrel, 'utf8');
    if (!source.includes('defineCustomElementMdsButton')) {
      fail(
        'dist/components/index.js does not re-export components - check customElementsExportBehavior',
      );
    }
    if (source.includes('globalScripts()')) {
      fail('dist/components/index.js calls globalScripts() - set includeGlobalScripts: false');
    }
  }

  // One ES module per component in both wrappers (`esModules: true`). Without
  // it every wrapper lives in a single module and nothing can be dropped.
  if (requireBuilt(DIST_REACT_DIR, 'nx run stencil-react:build')) {
    const missing = componentTags.filter(
      (tag) => !fs.existsSync(path.join(DIST_REACT_DIR, `${tag}.js`)),
    );
    if (missing.length > 0) {
      fail(
        `magma-react ships no per-component module for ${missing.length} component(s) ` +
          `(e.g. ${missing.slice(0, 3).join(', ')}) - check reactOutputTarget esModules`,
      );
    }
  }

  const angularGenerated = path.resolve(PROJECT_DIR, 'angular/magma-angular/src/stencil-generated');
  if (requireBuilt(angularGenerated, 'nx run stencil:build')) {
    const missing = componentTags.filter(
      (tag) => !fs.existsSync(path.join(angularGenerated, `${tag}.ts`)),
    );
    if (missing.length > 0) {
      fail(
        `magma-angular has no per-component proxy for ${missing.length} component(s) ` +
          `(e.g. ${missing.slice(0, 3).join(', ')}) - check angularOutputTarget esModules`,
      );
    }
  }

  // The wrappers must never reach for the lazy loader: it registers all 114
  // components and defeats every other measure here.
  if (requireBuilt(ANGULAR_DIST_DIR, 'nx run stencil-angular:build')) {
    const fesmDir = path.join(ANGULAR_DIST_DIR, 'fesm2022');
    const bundles = fs.existsSync(fesmDir)
      ? fs.readdirSync(fesmDir).filter((file) => file.endsWith('.mjs'))
      : [];
    for (const bundle of bundles) {
      if (fs.readFileSync(path.join(fesmDir, bundle), 'utf8').includes('magma/loader')) {
        fail(`magma-angular ${bundle} imports magma/loader - it pulls in every component`);
      }
    }
  }
};

// ---------------------------------------------------------------------------
// 2. Bundle sizes
// ---------------------------------------------------------------------------

interface Fixture {
  /** package label used in the report */
  name: keyof typeof BUDGET_KB;
  /** source importing exactly one component */
  single: string;
  /** source importing the whole public surface */
  full: string;
  /** dependencies the consumer app provides, not the library */
  external: string[];
}

const FIXTURES: Fixture[] = [
  {
    name: 'magma',
    single: `import { defineCustomElementMdsButton } from '@maggioli-design-system/magma/components';
globalThis.keep = defineCustomElementMdsButton;`,
    full: `import * as magma from '@maggioli-design-system/magma/components';
globalThis.keep = magma;`,
    external: [],
  },
  {
    name: 'magma-react',
    single: `import { MdsButton } from '@maggioli-design-system/magma-react';
globalThis.keep = MdsButton;`,
    full: `import * as magma from '@maggioli-design-system/magma-react';
globalThis.keep = magma;`,
    external: ['react', 'react-dom', 'react/jsx-runtime'],
  },
];

const bundleSize = async (fixture: Fixture, source: string, tag: string): Promise<number> => {
  const entry = path.join(TMP_DIR, `${fixture.name}.${tag}.js`);
  fs.writeFileSync(entry, source);

  const result = await build({
    absWorkingDir: WORKSPACE_ROOT,
    bundle: true,
    entryPoints: [entry],
    external: fixture.external,
    format: 'esm',
    logLevel: 'silent',
    minify: true,
    platform: 'browser',
    target: 'es2020',
    treeShaking: true,
    write: false,
    outdir: path.join(TMP_DIR, 'out'),
  });

  return result.outputFiles.reduce((total, file) => total + file.contents.byteLength, 0);
};

const kb = (bytes: number): number => Math.round((bytes / 1024) * 10) / 10;

const checkSizes = async (): Promise<void> => {
  fs.mkdirSync(TMP_DIR, { recursive: true });

  for (const fixture of FIXTURES) {
    let single: number;
    let full: number;
    try {
      single = await bundleSize(fixture, fixture.single, 'single');
      full = await bundleSize(fixture, fixture.full, 'full');
    } catch (error) {
      fail(`${fixture.name}: bundling failed - ${(error as Error).message}`);
      continue;
    }

    const ratio = full === 0 ? 1 : single / full;
    const budget = BUDGET_KB[fixture.name];

    notes.push(
      `${fixture.name.padEnd(14)} 1 component ${String(kb(single)).padStart(7)} kB` +
        `   whole library ${String(kb(full)).padStart(7)} kB` +
        `   ratio ${(ratio * 100).toFixed(1)}%`,
    );

    if (kb(single) > budget) {
      fail(
        `${fixture.name}: one component bundles to ${kb(single)} kB, over the ${budget} kB budget`,
      );
    }
    if (ratio > MAX_SINGLE_TO_FULL_RATIO) {
      fail(
        `${fixture.name}: one component is ${(ratio * 100).toFixed(1)}% of the whole library ` +
          `(max ${MAX_SINGLE_TO_FULL_RATIO * 100}%) - tree-shaking is not working`,
      );
    }
  }
};

// ---------------------------------------------------------------------------
// 3. Angular consumer build
// ---------------------------------------------------------------------------

const checkAngularProbe = (): void => {
  if (!requireBuilt(ANGULAR_DIST_DIR, 'nx run stencil-angular:build')) {
    return;
  }

  try {
    execFileSync('npm', ['run', 'build.treeshaking-probe'], {
      cwd: ANGULAR_DIR,
      stdio: 'pipe',
    });
  } catch (error) {
    const details = (error as { stderr?: Buffer; stdout?: Buffer }).stderr?.toString() ?? '';
    fail(
      `magma-angular: probe app failed to build - ${details.trim() || (error as Error).message}`,
    );
    return;
  }

  const bundles = fs.existsSync(ANGULAR_PROBE_OUT_DIR)
    ? fs.readdirSync(ANGULAR_PROBE_OUT_DIR).filter((file) => file.endsWith('.js'))
    : [];
  if (bundles.length === 0) {
    fail(`magma-angular: probe app produced no bundle in ${ANGULAR_PROBE_OUT_DIR}`);
    return;
  }

  let bytes = 0;
  const sources: string[] = [];
  for (const bundle of bundles) {
    const file = path.join(ANGULAR_PROBE_OUT_DIR, bundle);
    bytes += fs.statSync(file).size;
    sources.push(fs.readFileSync(file, 'utf8'));
  }
  const source = sources.join('\n');

  notes.push(
    `magma-angular  1 component ${String(kb(bytes)).padStart(7)} kB` +
      `   (ng build, Angular framework included)`,
  );

  const budget = BUDGET_KB['magma-angular'];
  if (kb(bytes) > budget) {
    fail(`magma-angular: probe app is ${kb(bytes)} kB, over the ${budget} kB budget`);
  }

  const leaked = TAGS_ABSENT_FROM_PROBE.filter((tag) => source.includes(`"${tag}"`));
  if (leaked.length > 0) {
    fail(
      `magma-angular: probe app ships components it never imports (${leaked.join(', ')}) - ` +
        `tree-shaking is not working`,
    );
  }
};

const main = async (): Promise<void> => {
  console.info(`Checking tree-shaking across ${componentTags.length} components\n`);

  checkStructure();
  await checkSizes();
  checkAngularProbe();

  for (const note of notes) {
    console.info(`  ${note}`);
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} tree-shaking check(s) failed:`);
    for (const failure of failures) {
      console.error(`  ✖ ${failure}`);
    }
    process.exitCode = 1;
    return;
  }

  console.info('\n✔ tree-shaking checks passed');
};

void main();
