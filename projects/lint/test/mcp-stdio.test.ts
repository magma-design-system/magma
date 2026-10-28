// The command over stdio, through the official MCP client: the handshake, the list of tools,
// and a call of each one, whose structured content the client validates against the tool's
// output schema.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { afterAll, beforeAll, expect, test } from 'vitest';

import { context, data, fixtures } from './mcp-context.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const repository = path.resolve(here, '../../..');
let client: Client;

beforeAll(async () => {
  const transport = new StdioClientTransport({
    command: path.join(repository, 'node_modules/.bin/tsx'),
    args: [
      path.join(here, '../src/mcp/cli.ts'),
      '--root',
      context.root,
      '--documentation',
      data.documentation,
      '--tokens',
      data.tokens,
      '--consumption',
      data.consumption,
      '--globals',
      data.globals,
      '--icons-mgg',
      path.join(fixtures, 'icons/mgg'),
    ],
    stderr: 'pipe',
  });
  client = new Client({ name: 'magma-test', version: '1.0.0' });
  await client.connect(transport);
}, 30_000);

afterAll(async () => {
  await client?.close();
});

test('the handshake names the server, the version of magma and when to use it', () => {
  expect(client.getServerVersion()).toMatchObject({ name: 'magma', version: '2.5.1' });
  expect(client.getInstructions()).toMatch(/check_markup/);
});

test('lists the eleven tools, read-only, each with an output schema', async () => {
  const { tools } = await client.listTools();
  expect(tools).toHaveLength(11);
  for (const tool of tools) {
    expect(tool.annotations?.readOnlyHint).toBe(true);
    expect(tool.outputSchema?.type).toBe('object');
  }
});

test.each([
  ['find_component', { query: 'date range' }],
  ['get_component', { tag: 'mds-input' }],
  ['get_usage', { tag: 'mds-input', framework: 'angular' }],
  ['list_tokens', { query: 'radius', tier: 'all' }],
  ['suggest_role', { color: 'bg-tone-neutral-03' }],
  ['explain_class', { class: 'p-4' }],
  ['find_icon', { query: 'send' }],
  ['get_guide', { guide: 'color', section: 'name the role' }],
  ['get_pattern', {}],
  ['get_pattern', { need: 'a save failed' }],
  ['get_pattern', { id: 'message-placement' }],
  ['get_pattern', { id: 'message-placement', situation: { about: 'action', outcome: 'success' } }],
  [
    'get_pattern',
    {
      id: 'confirm-action',
      situation: {
        reversible: 'no',
        'reaches-others': 'no',
        items: 'one',
        frequency: 'occasional',
        stakes: 'normal',
      },
    },
  ],
  ['get_pattern', { id: 'confirm-action', section: 'Parts' }],
  ['get_pattern', { id: 'consent-and-legal' }],
  ['check_markup', { code: '<mds-button disabled="false">Go</mds-button>', language: 'html' }],
  ['check_setup', {}],
])(
  '%s answers with content its output schema accepts',
  async (name, args) => {
    // the client checks structuredContent against the outputSchema of the tool
    const result = await client.callTool({ name, arguments: args }, CallToolResultSchema);
    expect(result.isError).toBeFalsy();
    expect(result.structuredContent).toBeTypeOf('object');
  },
  30_000,
);

test('a tool error comes back as content the agent can read', async () => {
  const result = await client.callTool(
    { name: 'get_component', arguments: { tag: 'mds-nope' } },
    CallToolResultSchema,
  );
  expect(result.isError).toBe(true);
  expect(result.content).toEqual([
    expect.objectContaining({ type: 'text', text: expect.stringMatching(/No component mds-nope/) }),
  ]);
});
