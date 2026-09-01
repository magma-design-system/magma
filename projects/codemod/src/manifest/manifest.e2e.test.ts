/**
 * End-to-end regression tests against the REAL curated manifest. The transform
 * suites run on the stable `test-manifest.ts`, so they cannot catch curation
 * mistakes in `manifest.ts` itself — this suite pins the migrations that were
 * shipped wrong once (mds-button `tone="quiet"` briefly mapped to `weak`
 * instead of the per-tag override `text`).
 */
import { manifest } from './manifest.js';
import { transformHtml } from '../surfaces/html.js';
import { transformReact } from '../surfaces/react.js';

describe('real manifest — mds-button tone quiet → text', () => {
  it('html', () => {
    expect(
      transformHtml('<mds-button tone="quiet">Salva</mds-button>', manifest, { file: 'x.html' })
        .output,
    ).toBe('<mds-button tone="text" label="Salva"></mds-button>');
  });

  it('react component', () => {
    expect(
      transformReact('<MdsButton tone="quiet">Salva</MdsButton>', manifest, { file: 'x.tsx' })
        .output,
    ).toBe('<MdsButton tone="text" label="Salva" />');
  });

  it('react intrinsic element', () => {
    expect(
      transformReact('<mds-button tone="quiet">Salva</mds-button>', manifest, { file: 'x.tsx' })
        .output,
    ).toBe('<mds-button tone="text" label="Salva" />');
  });

  it('keeps the global quiet → weak mapping on non-override components', () => {
    // mds-banner also gains the variant="light" ensureAttr guard, so only the
    // tone attribute is asserted.
    expect(
      transformHtml('<mds-banner tone="quiet"></mds-banner>', manifest, { file: 'x.html' }).output,
    ).toContain('tone="weak"');
  });
});

describe('real manifest — utility-class migrations (J)', () => {
  const runHtml = (src: string) => transformHtml(src, manifest, { file: 'x.html' });

  it('renames the ring family and the shifted radius scale in one single pass', () => {
    expect(runHtml('<div class="shadow-outline-light rounded-xl rounded-md">x</div>').output).toBe(
      '<div class="shadow-ring-weak rounded-md rounded-2xs">x</div>',
    );
  });

  it('renames the retuned border/gap steps to their value-stable names', () => {
    expect(runHtml('<div class="border-md border-lg gap gap-3xl">x</div>').output).toBe(
      '<div class="border-sm border-200 gap-lg gap-2000">x</div>',
    );
  });

  it('leaves the value-stable classes alone', () => {
    const src =
      '<div class="shadow shadow-md rounded-none rounded-full border gap-md p-400">x</div>';
    const { changed, output } = runHtml(src);
    expect(changed).toBe(false);
    expect(output).toBe(src);
  });

  it('reports shadow-outline-strong (v2 reuses the name for a different shadow)', () => {
    const { changed, findings } = runHtml('<div class="shadow-outline-strong">x</div>');
    expect(changed).toBe(false);
    const warn = findings.find((f) => f.ruleId === 'global/classReport/shadow-outline-strong');
    expect(warn?.kind).toBe('warn');
    expect(warn?.message).toContain('silent restyle');
  });
});
