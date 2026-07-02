import { transformInlineTemplates } from './inline-templates.js';
import { testManifest as manifest } from '../manifest/test-manifest.js';

const ctx = { file: 'x.ts' };
const run = (src: string) => transformInlineTemplates(src, manifest, ctx);

describe('transformInlineTemplates', () => {
  it('rewrites an Angular @Component inline template', () => {
    const src = [
      "import { Component } from '@angular/core';",
      '@Component({',
      "  selector: 'x',",
      '  template: `<mds-button>Save</mds-button>`,',
      '})',
      'export class X {}',
    ].join('\n');
    const { output, changed } = run(src);
    expect(changed).toBe(true);
    expect(output).toContain('<mds-button label="Save"></mds-button>');
  });

  it('handles Angular bindings inside the inline template', () => {
    const src =
      '@Component({ template: `<mds-dropdown [arrow]="open"></mds-dropdown>` }) class X {}';
    expect(run(src).output).toContain('[hideArrow]="!open"');
  });

  it('rewrites generic inline HTML in a template literal', () => {
    const src = 'el.innerHTML = `<mds-dropdown arrow="false"></mds-dropdown>`;';
    expect(run(src).output).toContain('hide-arrow');
  });

  it('flags template literals with ${} interpolation', () => {
    const src = 'const t = `<mds-button>${x}</mds-button>`;';
    const { changed, findings } = run(src);
    expect(changed).toBe(false);
    expect(findings.some((f) => f.kind === 'dynamic')).toBe(true);
  });

  it('ignores literals without mds-* tags', () => {
    expect(run('const t = `<div>hello</div>`;')).toMatchObject({ changed: false });
  });

  it('is idempotent', () => {
    const src = '@Component({ template: `<mds-button>Save</mds-button>` }) class X {}';
    const once = run(src).output;
    const twice = run(once);
    expect(twice.changed).toBe(false);
    expect(twice.output).toBe(once);
  });
});
