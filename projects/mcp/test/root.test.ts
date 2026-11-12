// Where the command finds the project (#1387): --root, the folder the client starts it in when
// that declares magma, or else the project it runs magma from, inside that folder. The layouts
// are the ones the package managers write: npm's .bin, pnpm's store, the cache of npx -p.
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

import { projectFolder } from '../src/context.js';
import { BIN_FILE, declaresMagma, installedIn, projectRoot } from '../src/root.js';

const MAGMA = '@maggioli-design-system/magma';

/** A folder made of `files`, each a package.json by default. */
const folderOf = (files: Record<string, unknown> = {}): string => {
  const dir = mkdtempSync(path.join(tmpdir(), 'magma-root-'));
  for (const [name, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    writeFileSync(
      path.join(dir, name),
      typeof content === 'string' ? content : JSON.stringify(content),
    );
  }
  return dir;
};

/** A package.json that declares magma. */
const withMagma = { dependencies: { [MAGMA]: '2.13.0' } };

/** The file the client names when it runs node on the copy of magma a project installed. */
const binOf = (project: string) => path.join(project, 'node_modules', MAGMA, BIN_FILE);

describe('projectRoot', () => {
  test('--root names the project, from the start folder', () => {
    const start = folderOf({ 'package.json': withMagma });
    expect(projectRoot({ option: 'apps/web', start, entry: binOf(start) })).toEqual({
      root: path.join(start, 'apps/web'),
      rootFrom: 'option',
    });
    expect(projectRoot({ option: '/elsewhere', start })).toEqual({
      root: path.resolve('/elsewhere'),
      rootFrom: 'option',
    });
  });

  test('the start folder is the project when it declares magma, in either dependency list', () => {
    for (const manifest of [withMagma, { devDependencies: { [MAGMA]: '^2.13.0' } }]) {
      const start = folderOf({
        'package.json': manifest,
        'tools/lab/package.json': withMagma,
      });
      // a copy in a sub-folder does not take the project away from a start folder that declares it
      expect(projectRoot({ start, entry: binOf(path.join(start, 'tools/lab')) })).toEqual({
        root: start,
        rootFrom: 'start',
      });
    }
  });

  test('the project the command runs magma from, inside the start folder (#1387)', () => {
    // the layout of the issue: a repository with no package.json, a lab with its own install
    const start = folderOf({ 'tools/asset_lab/package.json': withMagma });
    const lab = path.join(start, 'tools/asset_lab');
    const found = { root: lab, rootFrom: 'install' };
    // node on the copy of magma, as .mcp.json names it, relative to the start folder
    expect(projectRoot({ start, entry: path.relative(start, binOf(lab)) })).toEqual(found);
    // the .bin of npm, a symlink node does not resolve in argv[1]
    expect(projectRoot({ start, entry: path.join(lab, 'node_modules/.bin/magma-mcp') })).toEqual(
      found,
    );
    // the store of pnpm: the outermost node_modules is the project's
    const pnpm = path.join(
      lab,
      'node_modules/.pnpm/@maggioli-design-system+magma@2.13.0/node_modules',
      MAGMA,
      BIN_FILE,
    );
    expect(projectRoot({ start, entry: pnpm })).toEqual(found);
    // a start folder with a package.json that does not declare magma (the root of a monorepo)
    const monorepo = folderOf({ 'package.json': { private: true }, 'lab/package.json': withMagma });
    expect(projectRoot({ start: monorepo, entry: binOf(path.join(monorepo, 'lab')) })).toEqual({
      root: path.join(monorepo, 'lab'),
      rootFrom: 'install',
    });
  });

  test('otherwise the start folder: an install outside it, or of a folder that is no Magma project', () => {
    const start = folderOf({ 'tools/no-magma/package.json': { private: true } });
    const asBefore = { root: start, rootFrom: 'start' };
    // the cache of npx -p: its package.json declares magma, but it is no project of the workspace
    const cache = folderOf({ 'package.json': withMagma });
    expect(projectRoot({ start, entry: binOf(cache) })).toEqual(asBefore);
    // a folder inside the start folder whose package.json does not declare magma, or has none
    expect(projectRoot({ start, entry: binOf(path.join(start, 'tools/no-magma')) })).toEqual(
      asBefore,
    );
    expect(projectRoot({ start, entry: binOf(path.join(start, 'tools/none')) })).toEqual(asBefore);
    // a command run from a checkout (tsx on the sources), or no command at all
    expect(projectRoot({ start, entry: path.join(start, 'src/cli.ts') })).toEqual(asBefore);
    expect(projectRoot({ start })).toEqual(asBefore);
    // a sibling whose name starts like the start folder is not inside it
    const sibling = `${start}-lab`;
    mkdirSync(sibling);
    writeFileSync(path.join(sibling, 'package.json'), JSON.stringify(withMagma));
    expect(projectRoot({ start, entry: binOf(sibling) })).toEqual(asBefore);
  });
});

test('installedIn is the folder above the outermost node_modules', () => {
  expect(installedIn('/a/b/node_modules/x/node_modules/y/cli.js')).toBe(path.resolve('/a/b'));
  expect(installedIn('/node_modules/x/cli.js')).toBe(path.resolve('/'));
  expect(installedIn('/a/b/src/cli.ts')).toBeUndefined();
});

test('declaresMagma reads the dependencies and the dev dependencies of package.json', () => {
  expect(declaresMagma(folderOf({ 'package.json': withMagma }))).toBe(true);
  expect(declaresMagma(folderOf({ 'package.json': { peerDependencies: { [MAGMA]: '*' } } }))).toBe(
    false,
  );
  expect(declaresMagma(folderOf({ 'package.json': 'not json' }))).toBe(false);
  expect(declaresMagma(folderOf())).toBe(false);
});

test('an error names the project folder and how the command found it', () => {
  const settings = {};
  expect(projectFolder({ root: '/p', settings })).toBe('/p');
  expect(projectFolder({ root: '/p', rootFrom: 'option', settings })).toBe('/p (named by --root)');
  expect(projectFolder({ root: '/p', rootFrom: 'start', settings })).toBe(
    '/p (the folder the client started the server in)',
  );
  expect(projectFolder({ root: '/p', rootFrom: 'install', settings })).toBe(
    '/p (the project the command runs magma from)',
  );
});
