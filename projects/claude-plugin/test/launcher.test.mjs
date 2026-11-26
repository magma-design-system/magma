/*
  The launcher of the MCP server (bin/magma-mcp.mjs), run as Claude Code runs it: a process that
  speaks JSON-RPC on stdio, the project in CLAUDE_PROJECT_DIR. Each project is a folder of its
  own in the temporary directory; an installed magma is a stand-in for its cli.js that writes what
  it was started with and exits.
*/
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';

const LAUNCHER = fileURLToPath(new URL('../bin/magma-mcp.mjs', import.meta.url));
// realpath: on macOS the temporary directory is a link, and a process reports its real cwd
const TMP = realpathSync(mkdtempSync(path.join(tmpdir(), 'magma-launcher-')));
afterAll(() => rmSync(TMP, { recursive: true, force: true }));

let count = 0;
/** A project folder, with the files given (path -> content). */
const project = (files = {}) => {
  const dir = path.join(TMP, `project-${(count += 1)}`);
  mkdirSync(dir, { recursive: true });
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    writeFileSync(path.join(dir, file), content);
  }
  return dir;
};

const SERVER = 'node_modules/@maggioli-design-system/magma/dist/mcp/cli.js';
// stands in for the server of magma: says how it was started, and exits with code 3
const STAND_IN = `process.stdout.write(JSON.stringify({
  entry: process.argv[1],
  args: process.argv.slice(2),
  cwd: process.cwd(),
  startedBy: process.env.MAGMA_MCP_STARTED_BY,
}));
process.exit(3);
`;

/** Runs the launcher with these lines on its input; resolves with its output lines and code. */
const run = ({ dir, cwd = TMP, args = [], lines = [] }) =>
  new Promise((resolve, reject) => {
    const env = { ...process.env };
    delete env.CLAUDE_PROJECT_DIR;
    if (dir) env.CLAUDE_PROJECT_DIR = dir;
    const child = spawn(process.execPath, [LAUNCHER, ...args], { cwd, env });
    let out = '';
    child.stdout.on('data', (chunk) => (out += chunk));
    child.on('error', reject);
    child.on('exit', (code) => resolve({ out, code }));
    child.stdin.end(lines.map((line) => `${line}\n`).join(''));
  });

const responses = (out) =>
  out
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));

describe('with magma installed in the project', () => {
  it('runs its server from the project, with the arguments, and exits with its code', async () => {
    const dir = project({ [SERVER]: STAND_IN });
    const { out, code } = await run({ dir, args: ['--root', 'app'] });
    expect(code).toBe(3);
    expect(JSON.parse(out)).toEqual({
      // the path inside node_modules, from which the server finds the project (root.ts, step 3)
      entry: path.join(dir, SERVER),
      args: ['--root', 'app'],
      cwd: dir,
      startedBy: 'claude-plugin',
    });
  });

  it('finds the magma of a folder above, as Node resolves a package', async () => {
    const dir = project({ [SERVER]: STAND_IN, 'packages/app/package.json': '{}' });
    const { out } = await run({ dir: path.join(dir, 'packages/app') });
    expect(JSON.parse(out)).toMatchObject({
      entry: path.join(dir, SERVER),
      cwd: path.join(dir, 'packages/app'),
    });
  });

  it('takes the folder it starts in when Claude Code names no project', async () => {
    const dir = project({ [SERVER]: STAND_IN });
    const { out } = await run({ cwd: dir });
    expect(JSON.parse(out)).toMatchObject({ entry: path.join(dir, SERVER), cwd: dir });
  });
});

describe('without magma in the project', () => {
  const session = [
    JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test' } },
    }),
    JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
    JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }),
    JSON.stringify({ jsonrpc: '2.0', id: 3, method: 'ping' }),
    JSON.stringify({
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: { name: 'get_component' },
    }),
    'not json',
  ];

  it('answers as a server with no tools, and ends with its input', async () => {
    const { out, code } = await run({
      dir: project({ 'package.json': '{"name":"other"}' }),
      lines: session,
    });
    expect(code).toBe(0);
    const [initialize, list, ping, call, parse] = responses(out);
    // the notification gets no answer
    expect(responses(out)).toHaveLength(5);
    expect(initialize).toEqual({
      jsonrpc: '2.0',
      id: 1,
      result: {
        protocolVersion: '2025-06-18',
        capabilities: { tools: {} },
        serverInfo: { name: 'magma', title: 'Magma (not installed here)', version: '0.0.0' },
      },
    });
    expect(list).toEqual({ jsonrpc: '2.0', id: 2, result: { tools: [] } });
    expect(ping).toEqual({ jsonrpc: '2.0', id: 3, result: {} });
    expect(call.error.code).toBe(-32601);
    expect(parse).toEqual({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: 'Parse error' },
    });
  });

  it('answers the newest version it speaks to a version it does not know', async () => {
    const line = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { protocolVersion: '1999-01-01' },
    });
    const { out } = await run({ dir: project(), lines: [line] });
    expect(responses(out)[0].result.protocolVersion).toBe('2025-11-25');
  });

  it('says to install the dependencies when the project declares magma', async () => {
    const dir = project({
      'package.json': JSON.stringify({
        dependencies: { '@maggioli-design-system/magma': '^2.13.0' },
      }),
    });
    const { out } = await run({ dir, lines: [session[0]] });
    expect(responses(out)[0].result.instructions).toMatch(
      /declares @maggioli-design-system\/magma but has not installed it/,
    );
  });
});
