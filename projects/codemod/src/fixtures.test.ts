import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { testManifest as manifest } from './manifest/test-manifest.js';
import { transformAngular } from './surfaces/angular.js';
import { transformCss } from './surfaces/css.js';
import { transformHtml } from './surfaces/html.js';
import { transformReact } from './surfaces/react.js';
import { type TransformContext, type TransformResult } from './surfaces/shared/transform.js';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');

interface SurfaceConfig {
  ext: string;
  run: (source: string, ctx: TransformContext) => TransformResult;
}

const SURFACES: Record<string, SurfaceConfig> = {
  html: { ext: 'html', run: (s, ctx) => transformHtml(s, manifest, ctx) },
  css: { ext: 'css', run: (s, ctx) => transformCss(s, manifest, ctx, { scss: false }) },
  react: { ext: 'tsx', run: (s, ctx) => transformReact(s, manifest, ctx) },
  angular: { ext: 'html', run: (s, ctx) => transformAngular(s, manifest, ctx) },
};

describe('fixtures', () => {
  for (const [surface, cfg] of Object.entries(SURFACES)) {
    const dir = join(FIXTURES, surface);
    const cases = existsSync(dir) ? readdirSync(dir) : [];

    describe(surface, () => {
      for (const name of cases) {
        const caseDir = join(dir, name);
        const input = readFileSync(join(caseDir, `input.${cfg.ext}`), 'utf8');
        const expected = readFileSync(join(caseDir, `expected.${cfg.ext}`), 'utf8');

        it(`${name}: transforms input into expected`, () => {
          expect(cfg.run(input, { file: `${name}/input.${cfg.ext}` }).output).toBe(expected);
        });

        it(`${name}: is idempotent on expected`, () => {
          const result = cfg.run(expected, { file: `${name}/expected.${cfg.ext}` });
          expect(result.changed).toBe(false);
          expect(result.output).toBe(expected);
        });
      }
    });
  }
});
