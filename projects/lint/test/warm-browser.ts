// The globalSetup of the tests: one render before any test file. The first browser of a fresh
// CI runner starts cold: on 30 runs of consumer-lint the first test that renders took 2.9 to
// 23.4 s, and past its 30 s twice, while the next one took 1.05 to 1.30 s every time (#1271).
// Here that start is no test's time, and the log says how long it took. A machine that cannot
// render fails in the tests that render, with their own words.
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { render } from '../src/mcp/render.js';
import { context, fixtures } from './mcp-context.js';

export default async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'magma-warm-'));
  const loader = path.join(fixtures, 'components/magma-components.esm.js');
  const started = Date.now();
  try {
    await render(
      { ...context, root, loader },
      { markup: '<mds-fixture>Salva</mds-fixture>', widths: [480], mode: 'light' },
    );
    console.log(`render_preview: the browser started and rendered in ${Date.now() - started} ms`);
  } catch (error) {
    console.log(`render_preview: no warm-up render, ${(error as Error).message.split('\n')[0]}`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};
