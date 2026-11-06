// The server as magma ships it (#1244): compiled into dist/mcp by the stencil build, started as
// the magma-mcp command of the package, reaching the lint through the exports of magma (with no
// tsconfig, as in a consumer project). On the build of this repository: skipped when there is
// none, required on CI.
import { accessSync, constants, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
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
    expect(manifest.bin).toEqual({ 'magma-mcp': 'dist/mcp/cli.js' });
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
  });
});
