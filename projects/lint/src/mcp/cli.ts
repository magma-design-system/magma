#!/usr/bin/env node
/*
  magma-mcp: the Magma MCP server on stdio, started by the agent's client
  (agents/mcp.md). The project is the directory it starts in, or --root <dir>; the data paths
  can be pointed elsewhere with --documentation, --tokens, --consumption, --globals, the
  icon folders with --icons-mi, --icons-mdi, --icons-mgg and the loader of the components
  render_preview loads with --loader. It writes protocol messages only to stdout and anything
  else to stderr.
*/
import path from 'node:path';
import { serveStdio } from './protocol.js';
import { createServer } from './server.js';
import type { ToolContext } from './context.js';

const args = process.argv.slice(2);
const option = (name: string): string | undefined => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? undefined : args[index + 1];
};

const root = path.resolve(option('root') ?? process.cwd());
const settings = Object.fromEntries(
  ['documentation', 'tokens', 'consumption', 'globals']
    .map((name) => [name, option(name)])
    .filter(([, value]) => value),
);
const icons = Object.fromEntries(
  (['mi', 'mdi', 'mgg'] as const)
    .map((set) => [set, option(`icons-${set}`)])
    .filter(([, value]) => value),
);
const loader = option('loader');
const context: ToolContext = {
  root,
  settings: { root, ...settings },
  ...(Object.keys(icons).length ? { icons } : {}),
  ...(loader ? { loader: path.resolve(loader) } : {}),
};

serveStdio(createServer(context).handle);
