// The protocol of the MCP server, message by message, without a transport.
import { describe, expect, test } from 'vitest';

import {
  PROTOCOL_VERSIONS,
  ToolError,
  createHandler,
  toolList,
  withImages,
  type Tool,
} from '../src/mcp/protocol.js';

const echo: Tool = {
  name: 'echo',
  title: 'Echo',
  description: 'Returns its text.',
  inputSchema: { type: 'object', properties: { text: { type: 'string' } } },
  outputSchema: { type: 'object', properties: { text: { type: 'string' } } },
  run: ({ text }) => {
    if (!text) throw new ToolError('Give a text.');
    return { text: String(text) };
  },
};
const handle = createHandler(
  [echo],
  { name: 'test', title: 'Test', version: '1.0.0' },
  'Use echo.',
);

describe('the MCP protocol', () => {
  test('negotiates the version: the client one when spoken, else the newest', async () => {
    const asked = await handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { protocolVersion: '2025-06-18' },
    });
    expect(asked).toMatchObject({
      id: 1,
      result: {
        protocolVersion: '2025-06-18',
        capabilities: { tools: {} },
        serverInfo: { name: 'test' },
        instructions: 'Use echo.',
      },
    });
    const unknown = await handle({
      jsonrpc: '2.0',
      id: 2,
      method: 'initialize',
      params: { protocolVersion: '1999-01-01' },
    });
    expect(unknown).toMatchObject({ result: { protocolVersion: PROTOCOL_VERSIONS[0] } });
  });

  test('answers ping and lists the tools as read-only', async () => {
    expect(await handle({ jsonrpc: '2.0', id: 3, method: 'ping' })).toEqual({
      jsonrpc: '2.0',
      id: 3,
      result: {},
    });
    expect(await handle({ jsonrpc: '2.0', id: 4, method: 'tools/list' })).toMatchObject({
      result: { tools: [{ name: 'echo', annotations: { readOnlyHint: true } }] },
    });
  });

  test('returns a result as text and as structured content, a tool error as content', async () => {
    expect(
      await handle({
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: { name: 'echo', arguments: { text: 'hi' } },
      }),
    ).toMatchObject({
      result: { structuredContent: { text: 'hi' }, content: [{ type: 'text' }] },
    });
    expect(
      await handle({
        jsonrpc: '2.0',
        id: 6,
        method: 'tools/call',
        params: { name: 'echo', arguments: {} },
      }),
    ).toMatchObject({
      result: { isError: true, content: [{ type: 'text', text: 'Give a text.' }] },
    });
  });

  test('answers the images of a result as image content, out of its structured content', async () => {
    const shot: Tool = {
      ...echo,
      name: 'shot',
      annotations: { readOnlyHint: false },
      run: () => withImages({ file: 'a.png' }, [{ data: 'iVBORw0KGgo=', mimeType: 'image/png' }]),
    };
    const answer = await createHandler(
      [shot],
      { name: 'test', title: 'Test', version: '1.0.0' },
      '',
    )({
      jsonrpc: '2.0',
      id: 9,
      method: 'tools/call',
      params: { name: 'shot', arguments: {} },
    });
    expect(JSON.parse(JSON.stringify(answer))).toEqual({
      jsonrpc: '2.0',
      id: 9,
      result: {
        content: [
          { type: 'text', text: JSON.stringify({ file: 'a.png' }, null, 2) },
          { type: 'image', data: 'iVBORw0KGgo=', mimeType: 'image/png' },
        ],
        structuredContent: { file: 'a.png' },
      },
    });
    // a tool that writes says so; the others keep the read-only default
    expect(toolList([echo, shot]).tools.map((one) => one.annotations)).toEqual([
      { readOnlyHint: true, openWorldHint: false },
      { readOnlyHint: false, openWorldHint: false },
    ]);
  });

  test('answers no notification, and a JSON-RPC error to what it does not know', async () => {
    expect(await handle({ jsonrpc: '2.0', method: 'notifications/initialized' })).toBeUndefined();
    expect(await handle({ jsonrpc: '2.0', id: 7, method: 'resources/list' })).toMatchObject({
      error: { code: -32601 },
    });
    expect(
      await handle({ jsonrpc: '2.0', id: 8, method: 'tools/call', params: { name: 'nope' } }),
    ).toMatchObject({ error: { code: -32602 } });
    expect(await handle([])).toMatchObject({ error: { code: -32600 } });
  });
});
