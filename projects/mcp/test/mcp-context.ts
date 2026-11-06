// The context the MCP tests run in: an installed magma stood in by the fixtures, a fixture
// project, the mgg icons of the fixtures and the mi and mdi sets installed in this repository.
// The data the lint tests read too (documentation.json, the DTCG base set, the consumption map)
// is read from the fixtures of projects/lint, never copied into the repository.
import { cpSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ToolContext } from '../src/context.js';

const here = path.dirname(fileURLToPath(import.meta.url));

/** The fixtures of this project: what only the server reads. */
export const fixtures = path.join(here, 'fixtures');

/** The fixtures of the lint: the data cut from the real packages, which both read. */
export const lintFixtures = path.resolve(here, '../../lint/test/fixtures');

/**
 * The fake installed magma: its manifest (version 2.5.1), AGENTS.md and agents/ from the
 * fixtures of this project, and the documentation.json of the lint two folders below its root,
 * where the server looks for it (magmaRoot of the core). Put together once per test file, in a
 * folder of its own.
 */
export const magma = mkdtempSync(path.join(tmpdir(), 'magma-fixture-'));
cpSync(path.join(fixtures, 'magma'), magma, { recursive: true });
cpSync(path.join(lintFixtures, 'documentation.json'), path.join(magma, 'data/documentation.json'));

export const data = {
  documentation: path.join(magma, 'data/documentation.json'),
  tokens: path.join(lintFixtures, 'design-tokens/base.tokens.json'),
  consumption: path.join(lintFixtures, 'styles/consumption.json'),
  globals: path.join(fixtures, 'styles/globals.tokens.json'),
};

export const context: ToolContext = {
  root: path.join(fixtures, 'project'),
  settings: { root: lintFixtures, ...data },
  icons: { mgg: path.join(fixtures, 'icons/mgg') },
};
