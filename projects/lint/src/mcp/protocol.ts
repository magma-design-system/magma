/*
  The part of the Model Context Protocol the Magma server speaks, written here so the magma
  package carries no SDK: JSON-RPC 2.0 messages, one per line, over stdio
  (https://modelcontextprotocol.io/specification/2025-11-25/basic/transports#stdio).
  The server answers `initialize`, `ping`, `tools/list` and `tools/call`, and takes the
  notifications a client sends (`notifications/initialized`, `notifications/cancelled`)
  without answering them, as the specification wants for a notification. It offers tools
  only: no resources, no prompts, no sampling.
*/

/** The protocol versions this server can speak, newest first. */
export const PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];

export interface JsonSchema {
  [key: string]: unknown;
}

export interface Tool {
  name: string;
  title: string;
  description: string;
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
  /** Read-only: no tool of this server changes the project or the world. */
  run: (
    args: Record<string, unknown>,
  ) => Record<string, unknown> | Promise<Record<string, unknown>>;
}

/** A failure the tool explains to the agent: returned as a tool error, not a protocol one. */
export class ToolError extends Error {}

interface Request {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

type Response =
  | { jsonrpc: '2.0'; id: string | number | null; result: unknown }
  | { jsonrpc: '2.0'; id: string | number | null; error: { code: number; message: string } };

const ERROR = { parse: -32700, invalidRequest: -32600, method: -32601, params: -32602 };

const error = (id: Request['id'], code: number, message: string): Response => ({
  jsonrpc: '2.0',
  id: id ?? null,
  error: { code, message },
});

/**
 * Answer one message of a client, or nothing for a notification. `info` names the server
 * and `instructions` tells the agent when to reach for it.
 */
export const createHandler =
  (
    tools: Tool[],
    info: { name: string; title: string; version: string; [field: string]: unknown },
    instructions: string,
  ) =>
  async (message: unknown): Promise<Response | undefined> => {
    if (!message || typeof message !== 'object' || Array.isArray(message))
      return error(null, ERROR.invalidRequest, 'Expected one JSON-RPC 2.0 message');
    const { id, method, params = {} } = message as Request;
    if (typeof method !== 'string') return error(id, ERROR.invalidRequest, 'Missing method');
    // a notification gets no answer
    if (id === undefined) return undefined;
    const ok = (result: unknown): Response => ({ jsonrpc: '2.0', id, result });

    switch (method) {
      case 'initialize': {
        const asked = params.protocolVersion;
        return ok({
          // the client's version when this server speaks it, else the newest it speaks
          protocolVersion:
            typeof asked === 'string' && PROTOCOL_VERSIONS.includes(asked)
              ? asked
              : PROTOCOL_VERSIONS[0],
          capabilities: { tools: {} },
          serverInfo: info,
          instructions,
        });
      }
      case 'ping':
        return ok({});
      case 'tools/list':
        return ok({
          tools: tools.map(({ name, title, description, inputSchema, outputSchema }) => ({
            name,
            title,
            description,
            inputSchema,
            outputSchema,
            annotations: { readOnlyHint: true, openWorldHint: false },
          })),
        });
      case 'tools/call': {
        const tool = tools.find((one) => one.name === params.name);
        if (!tool) return error(id, ERROR.params, `Unknown tool: ${String(params.name)}`);
        try {
          const result = await tool.run((params.arguments ?? {}) as Record<string, unknown>);
          return ok({
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            structuredContent: result,
          });
        } catch (failure) {
          // a tool error goes back to the agent as content, so it can correct itself
          const text = failure instanceof Error ? failure.message : String(failure);
          return ok({ content: [{ type: 'text', text }], isError: true });
        }
      }
      default:
        return error(id, ERROR.method, `Method not found: ${method}`);
    }
  };

/** Serve the handler on stdin and stdout, one JSON message per line, until stdin closes. */
export const serveStdio = (handle: ReturnType<typeof createHandler>): void => {
  let buffer = '';
  const send = (response: Response) => process.stdout.write(`${JSON.stringify(response)}\n`);
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk: string) => {
    buffer += chunk;
    let newline: number;
    while ((newline = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (!line) continue;
      let message: unknown;
      try {
        message = JSON.parse(line);
      } catch {
        send(error(null, ERROR.parse, 'Parse error'));
        continue;
      }
      void handle(message).then((response) => response && send(response));
    }
  });
};
