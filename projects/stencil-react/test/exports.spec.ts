import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import * as client from '@maggioli-design-system/magma-react';
import * as server from '@maggioli-design-system/magma-react/components.server.js';
import { describe, expect, it } from 'vitest';

// Guards the options of the React output target in stencil.config.ts (`esModules`, `hydrateModule`,
// `clientModule`): one client and one server module per component, and barrels that export all of them.
const require = createRequire(import.meta.url);
const magmaDist = path.dirname(require.resolve('@maggioli-design-system/magma'));
const reactDist = path.dirname(require.resolve('@maggioli-design-system/magma-react'));

const documentation = JSON.parse(
  fs.readFileSync(path.join(magmaDist, 'documentation.json'), 'utf8'),
) as { components: Array<{ tag: string }> };
const tags = documentation.components.map(({ tag }) => tag).sort();

const pascalCase = (tag: string): string =>
  tag.replace(/(^|-)([a-z])/g, (_, __, letter: string) => letter.toUpperCase());
// the barrels also export the serializeShadowRoot option, which is not a component
const componentNames = (barrel: object): string[] =>
  Object.keys(barrel)
    .filter((name) => name !== 'serializeShadowRoot')
    .sort();

describe('generated wrappers', () => {
  it('are checked against the components of the magma build', () => {
    expect(tags.length).toBeGreaterThan(0);
  });

  it.each(tags)('%s has a client and a server module', (tag) => {
    expect(fs.existsSync(path.join(reactDist, `${tag}.js`))).toBe(true);
    expect(fs.existsSync(path.join(reactDist, `${tag}.server.js`))).toBe(true);
  });

  it('export one client wrapper per component from the barrel', () => {
    expect(componentNames(client)).toEqual(tags.map(pascalCase).sort());
  });

  it('export one server wrapper per component from the server barrel', () => {
    expect(componentNames(server)).toEqual(tags.map(pascalCase).sort());
  });
});
