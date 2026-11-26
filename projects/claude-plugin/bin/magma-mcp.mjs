#!/usr/bin/env node
/*
  The launcher of the Magma MCP server for the Claude Code plugin (#1524), what its .mcp.json
  starts. A person may enable the plugin for every project (scope user), and `npx --no magma-mcp`
  fails in a project without Magma: npx asks the registry for a package of that name, which is
  not Magma's, and Claude Code shows a failed server in every such project. The launcher looks
  for the magma the project installed and:

  - runs its server (dist/mcp/cli.js, the bin of magma) from the project, with the arguments it
    was given and its input and output passed through. The path it starts keeps the project's
    node_modules in it, so the server finds the project as it does under npx (root.ts, step 3);
    MAGMA_MCP_STARTED_BY tells check_setup that the plugin started it, at whatever scope;
  - otherwise answers as a server with no tools, so the client shows it connected and quiet. It
    gives instructions only when the project declares magma and has not installed it yet.

  The project is CLAUDE_PROJECT_DIR, which Claude Code sets for the servers it starts "so your
  server can resolve project-relative paths without depending on the working directory"
  (https://code.claude.com/docs/en/mcp.md, "Plugin-provided MCP servers"), else the folder the
  launcher starts in. Plain Node with no dependency: Claude Code runs the plugin from its copy of
  this repository, where nothing is installed.
*/
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline';

const MAGMA = '@maggioli-design-system/magma';
// the file the magma-mcp bin of magma runs (BIN_FILE of projects/mcp/src/root.ts, held by
// projects/mcp/test/shipped.test.ts)
const BIN_FILE = 'dist/mcp/cli.js';
// the versions the server of magma speaks (PROTOCOL_VERSIONS of projects/mcp/src/protocol.ts)
const PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];

/** The server of the magma installed in `start` or in a folder above it, as Node resolves it. */
const findServer = (start) => {
  for (let dir = path.resolve(start); ; dir = path.dirname(dir)) {
    const file = path.join(dir, 'node_modules', MAGMA, BIN_FILE);
    if (existsSync(file)) return file;
    if (path.dirname(dir) === dir) return undefined;
  }
};

/** The package.json of `dir` declares magma, as a dependency or a dev dependency. */
const declaresMagma = (dir) => {
  try {
    const manifest = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8'));
    return Boolean(manifest.dependencies?.[MAGMA] ?? manifest.devDependencies?.[MAGMA]);
  } catch {
    return false;
  }
};

/** The answer of a server with no tools to one message, or nothing for a notification. */
const answer = (message, instructions) => {
  if (!message || typeof message !== 'object' || Array.isArray(message))
    return {
      jsonrpc: '2.0',
      id: null,
      error: { code: -32600, message: 'Expected one JSON-RPC 2.0 message' },
    };
  const { id, method, params = {} } = message;
  if (id === undefined) return undefined;
  const ok = (result) => ({ jsonrpc: '2.0', id, result });
  switch (method) {
    case 'initialize':
      return ok({
        protocolVersion: PROTOCOL_VERSIONS.includes(params.protocolVersion)
          ? params.protocolVersion
          : PROTOCOL_VERSIONS[0],
        capabilities: { tools: {} },
        serverInfo: { name: 'magma', title: 'Magma (not installed here)', version: '0.0.0' },
        ...(instructions ? { instructions } : {}),
      });
    case 'ping':
      return ok({});
    case 'tools/list':
      return ok({ tools: [] });
    default:
      return { jsonrpc: '2.0', id, error: { code: -32601, message: `Unknown method ${method}` } };
  }
};

const start = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const server = findServer(start);

if (server) {
  const child = spawn(process.execPath, [server, ...process.argv.slice(2)], {
    cwd: start,
    stdio: 'inherit',
    env: { ...process.env, MAGMA_MCP_STARTED_BY: 'claude-plugin' },
  });
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
  child.on('error', (error) => {
    process.stderr.write(`magma: cannot start ${server}: ${error.message}\n`);
    process.exit(1);
  });
  child.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
} else {
  const instructions = declaresMagma(start)
    ? `This project declares ${MAGMA} but has not installed it: install its dependencies, then reconnect the magma server (/mcp).`
    : undefined;
  createInterface({ input: process.stdin }).on('line', (line) => {
    if (!line.trim()) return;
    let response;
    try {
      response = answer(JSON.parse(line), instructions);
    } catch {
      response = { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } };
    }
    if (response) process.stdout.write(`${JSON.stringify(response)}\n`);
  });
}
