// The context the MCP tests run in: the fixtures for the Magma data, a fixture project, the
// mgg icons of the fixtures and the mi and mdi sets installed in this repository.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ToolContext } from '../src/mcp/context.js';

export const fixtures = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

export const data = {
  documentation: path.join(fixtures, 'magma/data/documentation.json'),
  tokens: path.join(fixtures, 'design-tokens/base.tokens.json'),
  consumption: path.join(fixtures, 'styles/consumption.json'),
  globals: path.join(fixtures, 'styles/globals.tokens.json'),
};

export const context: ToolContext = {
  root: path.join(fixtures, 'project'),
  settings: { root: fixtures, ...data },
  icons: { mgg: path.join(fixtures, 'icons/mgg') },
};
