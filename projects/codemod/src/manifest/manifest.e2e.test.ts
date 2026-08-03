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
