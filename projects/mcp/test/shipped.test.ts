// The server as magma ships it (#1244): compiled into dist/mcp by the stencil build, started as
// the magma-mcp command of the package, reaching the lint through the exports of magma (with no
// tsconfig, as in a consumer project). On the build of this repository: skipped when there is
// none, required on CI.
import {
  accessSync,
  constants,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { BIN_FILE } from '../src/root.js';
import { toolsList } from '../src/server.js';

/** The package magma in this repository, and its build. */
const MAGMA = path.join(import.meta.dirname, '../../stencil');
const DIST = path.join(MAGMA, 'dist');
const CLI = path.join(DIST, 'mcp/cli.js');

const readJson = (file: string) => JSON.parse(readFileSync(file, 'utf8'));

describe.skipIf(!existsSync(CLI) && !process.env.CI)('the server as magma ships it', () => {
  const manifest = readJson(path.join(MAGMA, 'package.json')) as {
    bin: Record<string, string>;
    exports: Record<string, unknown>;
  };

  test('magma-mcp is the compiled server, executable', () => {
    // BIN_FILE: the file check_setup recognises in a client configuration that runs node on it
    expect(manifest.bin).toEqual({ 'magma-mcp': BIN_FILE });
    expect(() =>
      accessSync(path.join(MAGMA, manifest.bin['magma-mcp']!), constants.X_OK),
    ).not.toThrow();
  });

  test('tools.json is the answer of tools/list, exported at dist/mcp and where the docs site reads it', () => {
    const expected = toolsList({ root: MAGMA, settings: {} });
    for (const exported of ['./dist/mcp/tools.json', './dist/lint/mcp/tools.json']) {
      expect(manifest.exports[exported]).toBe(exported);
      expect(readJson(path.join(MAGMA, exported))).toEqual(expected);
    }
  });

  describe('started as the command of the package', () => {
    let client: Client;

    beforeAll(async () => {
      // node on the compiled server, no tsx and no tsconfig: the imports of the lint resolve
      // through the exports of magma, as in a project that installed it
      const transport = new StdioClientTransport({
        command: process.execPath,
        args: [CLI, '--root', MAGMA],
        stderr: 'pipe',
      });
      client = new Client({ name: 'magma-test', version: '1.0.0' });
      await client.connect(transport);
    }, 30_000);

    afterAll(async () => {
      await client?.close();
    });

    test('answers tools/list with the tools of tools.json', async () => {
      const { tools } = await client.listTools();
      const { tools: shipped } = readJson(path.join(DIST, 'mcp/tools.json')) as {
        tools: Array<{ name: string; description: string }>;
      };
      expect(tools.map(({ name, description }) => ({ name, description }))).toEqual(
        shipped.map(({ name, description }) => ({ name, description })),
      );
    });

    test('runs the lint it ships on a snippet, and reads the components it ships', async () => {
      const markup = await client.callTool(
        {
          name: 'check_markup',
          arguments: { code: '<mds-banner tone="outline"></mds-banner>', language: 'html' },
        },
        CallToolResultSchema,
      );
      expect(markup.isError).toBeFalsy();
      expect(markup.structuredContent).toMatchObject({
        findings: [expect.objectContaining({ rule: 'magma/valid-attribute-values' })],
      });
      const component = await client.callTool(
        { name: 'get_component', arguments: { tag: 'mds-button' } },
        CallToolResultSchema,
      );
      expect(component.isError).toBeFalsy();
      expect(component.structuredContent).toMatchObject({ tag: 'mds-button' });
    });

    // #1396, on the patterns the package ships: every case of a decided pattern gives the parts
    // of its solution with their role, and the answer for a situation gives them before its stage
    test('answers each case of a pattern with its parts and their role, before the stage', async () => {
      // the structured content of the tool, read freely
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type Result = Record<string, any>;
      const call = async (args: Record<string, unknown>) =>
        (await client.callTool({ name: 'get_pattern', arguments: args }, CallToolResultSchema))
          .structuredContent as Result;
      const decided = ((await call({})).patterns as Array<Record<string, string>>).filter(
        (one) => one.kind === 'pattern' && one.status === 'decided',
      );
      expect(decided.length).toBeGreaterThan(0);
      for (const { id } of decided)
        for (const one of (await call({ id })).pattern.cases as Result[])
          for (const entry of one.use ?? [])
            expect(entry, `${id}/${one.id}`).toEqual({
              role: expect.any(String),
              use: expect.stringMatching(/^mds-[a-z0-9-]+/),
            });
      const { answer } = await call({
        id: 'confirm-action',
        situation: {
          reversible: 'no',
          'reaches-others': 'no',
          items: 'one',
          frequency: 'occasional',
          stakes: 'normal',
        },
      });
      expect(answer.use.map((one: { use: string }) => one.use.split(' ')[0])).toEqual([
        'mds-modal',
        'mds-banner',
        'mds-text',
        'mds-button',
        'mds-button',
      ]);
      const keys = Object.keys(answer);
      expect(keys.indexOf('use')).toBeLessThan(keys.indexOf('preview'));
    });
  });

  test('finds the project it is installed in when the client starts it elsewhere (#1387)', async () => {
    // the layout of the issue: a repository with no package.json, a lab with its own install of
    // magma (here a symlink to the build), and node run on that copy from the repository
    const start = realpathSync(mkdtempSync(path.join(tmpdir(), 'magma-start-')));
    const lab = path.join(start, 'tools/asset_lab');
    mkdirSync(path.join(lab, 'node_modules/@maggioli-design-system'), { recursive: true });
    symlinkSync(MAGMA, path.join(lab, 'node_modules/@maggioli-design-system/magma'), 'dir');
    writeFileSync(
      path.join(lab, 'package.json'),
      JSON.stringify({ dependencies: { '@maggioli-design-system/magma': '*' } }),
    );
    const entry = path.join('tools/asset_lab/node_modules/@maggioli-design-system/magma', BIN_FILE);
    writeFileSync(
      path.join(start, '.mcp.json'),
      JSON.stringify({ mcpServers: { magma: { command: 'node', args: [entry] } } }),
    );
    const client = new Client({ name: 'magma-test', version: '1.0.0' });
    await client.connect(
      new StdioClientTransport({
        command: process.execPath,
        args: [entry],
        cwd: start,
        stderr: 'pipe',
      }),
    );
    try {
      const setup = await client.callTool(
        { name: 'check_setup', arguments: {} },
        CallToolResultSchema,
      );
      expect(setup.isError).toBeFalsy();
      expect(setup.structuredContent).toMatchObject({
        root: lab,
        rootFrom: 'install',
        checks: expect.arrayContaining([
          expect.objectContaining({
            id: 'mcp',
            ok: true,
            detail: `${path.join(start, '.mcp.json')} starts magma-mcp.`,
          }),
        ]),
      });
      // the patterns and the blocks read the same project: the layer goes into the lab, and
      // every path an answer names opens from the folder the client works in (absolute)
      const call = async (args: Record<string, unknown>) =>
        (await client.callTool({ name: 'get_pattern', arguments: args }, CallToolResultSchema))
          .structuredContent as Record<string, unknown> & {
          pattern: { situations?: Array<{ preview?: string }> };
        };
      expect((await call({ id: 'message-placement' })).layerFile).toBe(
        path.join(lab, 'magma/patterns/message-placement.md'),
      );
      expect((await call({})).layerDir).toBe(path.join(lab, 'magma/patterns'));
      const previews = (await call({ id: 'page-header' })).pattern.situations!.flatMap(
        (one) => one.preview ?? [],
      );
      expect(previews.length).toBeGreaterThan(0);
      for (const file of previews) {
        expect(path.isAbsolute(file), file).toBe(true);
        expect(existsSync(file), file).toBe(true);
      }
    } finally {
      await client.close();
    }
  }, 30_000);
});
