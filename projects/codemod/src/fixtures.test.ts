import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Manifest } from './manifest/schema.js';
import { testManifest, testManifestV3 } from './manifest/test-manifest.js';
import { type Finding } from './report/types.js';
import { transformAngular } from './surfaces/angular.js';
import { transformCss } from './surfaces/css.js';
import { transformHtml } from './surfaces/html.js';
import { transformInlineTemplates } from './surfaces/inline-templates.js';
import { transformReact } from './surfaces/react.js';
import { type TransformContext, type TransformResult } from './surfaces/shared/transform.js';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');

interface SurfaceConfig {
  ext: string;
  run: (source: string, manifest: Manifest, ctx: TransformContext) => TransformResult;
}

/**
 * The fixture directories: one per surface, `ts` for the `.ts` files (inline
 * templates and styles), `astro` for the components read as HTML.
 */
const SURFACES: Record<string, SurfaceConfig> = {
  html: { ext: 'html', run: (s, m, ctx) => transformHtml(s, m, ctx) },
  css: { ext: 'css', run: (s, m, ctx) => transformCss(s, m, ctx, { scss: false }) },
  scss: { ext: 'scss', run: (s, m, ctx) => transformCss(s, m, ctx, { scss: true }) },
  react: { ext: 'tsx', run: (s, m, ctx) => transformReact(s, m, ctx) },
  js: { ext: 'js', run: (s, m, ctx) => transformReact(s, m, ctx) },
  angular: { ext: 'html', run: (s, m, ctx) => transformAngular(s, m, ctx) },
  astro: { ext: 'astro', run: (s, m, ctx) => transformHtml(s, m, ctx) },
  ts: { ext: 'ts', run: (s, m, ctx) => transformInlineTemplates(s, m, ctx) },
};

/** The jump a case runs: `ctx.json` `"from": 2` is v2 -> v3, the default v1 -> v2. */
const MANIFESTS: Record<number, Manifest> = { 1: testManifest, 2: testManifestV3 };

/** A finding the case expects to be reported (anything but a change), from `reported.json`. */
interface Reported {
  kind: Finding['kind'];
  line: number;
  /** A piece of the message, or of the rewrite it proposes. */
  contains: string;
}

describe('fixtures', () => {
  for (const [surface, cfg] of Object.entries(SURFACES)) {
    const dir = join(FIXTURES, surface);
    const cases = existsSync(dir) ? readdirSync(dir) : [];

    describe(surface, () => {
      for (const name of cases) {
        const caseDir = join(dir, name);
        const input = readFileSync(join(caseDir, `input.${cfg.ext}`), 'utf8');
        const expected = readFileSync(join(caseDir, `expected.${cfg.ext}`), 'utf8');
        // Optional CLI-equivalent options for the case (e.g. category L's
        // `semantic.accept`), merged into the transform context.
        const ctxFile = join(caseDir, 'ctx.json');
        const { from = 1, ...extra } = existsSync(ctxFile)
          ? (JSON.parse(readFileSync(ctxFile, 'utf8')) as Partial<TransformContext> & {
              from?: number;
            })
          : {};
        const manifest = MANIFESTS[from]!;
        const run = (s: string, ctx: TransformContext): TransformResult =>
          cfg.run(s, manifest, ctx);

        it(`${name}: transforms input into expected`, () => {
          expect(run(input, { file: `${name}/input.${cfg.ext}`, ...extra }).output).toBe(expected);
        });

        // The cases left to a human: every finding that is not a change, in order.
        const reportedFile = join(caseDir, 'reported.json');
        if (existsSync(reportedFile)) {
          it(`${name}: reports what it cannot rewrite`, () => {
            const reported = JSON.parse(readFileSync(reportedFile, 'utf8')) as Reported[];
            const findings = run(input, { file: `${name}/input.${cfg.ext}`, ...extra })
              .findings.filter((f) => f.kind !== 'change')
              .map((f) => ({ kind: f.kind, line: f.line, text: `${f.message} ${f.after ?? ''}` }));
            expect(findings.map(({ kind, line }) => ({ kind, line }))).toEqual(
              reported.map(({ kind, line }) => ({ kind, line })),
            );
            reported.forEach((r, i) => expect(findings[i]!.text).toContain(r.contains));
          });
        }

        // A case with a RUN_ONCE file is not idempotent by construction: a v2 name
        // that is also a v1 name (`mds-pref-theme`) is renamed again by a second
        // run. The file says why; the test pins that a second run does change it,
        // which is what the README's "run it once" warns about.
        if (existsSync(join(caseDir, 'RUN_ONCE'))) {
          it(`${name}: is NOT idempotent on expected (RUN_ONCE)`, () => {
            const result = run(expected, { file: `${name}/expected.${cfg.ext}`, ...extra });
            expect(result.changed).toBe(true);
          });
          continue;
        }

        it(`${name}: is idempotent on expected`, () => {
          const result = run(expected, { file: `${name}/expected.${cfg.ext}`, ...extra });
          expect(result.changed).toBe(false);
          expect(result.output).toBe(expected);
        });
      }
    });
  }
});
