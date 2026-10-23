/*
  The Magma MCP server: the ten tools on the data of the installed magma, behind the protocol
  of ./protocol.ts. `createServer` is what the command (./cli.ts) serves on stdio and what the
  tests talk to directly.
*/
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { magmaRoot } from '../core/data.js';
import { readJsonFile, type ToolContext } from './context.js';
import { checkMarkup, checkSetup } from './checks.js';
import { findComponent, getComponent, getUsage } from './components.js';
import { getGuide } from './guides.js';
import { findIcon } from './icons.js';
import { createHandler, type Tool } from './protocol.js';
import { explainClass, listTokens, suggestRole } from './tokens.js';

/** What the agent reads when it connects: when to reach for the server. */
export const INSTRUCTIONS = [
  'Magma is the design system of this project: web components (mds-*), tokens and Tailwind classes. The tools answer from the version installed here.',
  'Before writing a component, find it (find_component), read its API (get_component) and how your framework writes it (get_usage). Before a colour, a spacing or a class, ask list_tokens, suggest_role or explain_class: Magma spacing steps are hundredths of a rem (p-4 is 0.01rem, p-400 is 1rem).',
  'Before an icon slug, check it with find_icon. After writing, check the snippet with check_markup. When the integration itself may be incomplete, run check_setup. For a rule or a setup step, read the section you need with get_guide.',
].join(' ');

export const toolsOf = (context: ToolContext): Tool[] =>
  [
    findComponent,
    getComponent,
    getUsage,
    listTokens,
    suggestRole,
    explainClass,
    findIcon,
    getGuide,
    checkMarkup,
    checkSetup,
  ].map((tool) => tool(context));

/**
 * The Magma mark, the icon a client may show next to the server: the stencil build copies it
 * from the build of identity beside this module (dist/lint/mcp/icon.svg). None from the sources.
 */
const iconsOf = () => {
  const file = path.join(path.dirname(fileURLToPath(import.meta.url)), 'icon.svg');
  if (!existsSync(file)) return [];
  const src = `data:image/svg+xml;base64,${readFileSync(file).toString('base64')}`;
  return [{ src, mimeType: 'image/svg+xml', sizes: ['any'] }];
};

export const createServer = (context: ToolContext) => {
  let version = '0.0.0';
  try {
    version =
      readJsonFile<{ version: string }>(path.join(magmaRoot(context.settings), 'package.json'))
        ?.version ?? version;
  } catch {
    // no magma found: the tools say so when they are called
  }
  const icons = iconsOf();
  const info = {
    name: 'magma',
    title: 'Magma design system',
    version,
    description:
      'The components, tokens, icons and guides of the Magma version installed in this project, and its lint.',
    websiteUrl: 'https://github.com/magma-design-system/magma',
    ...(icons.length ? { icons } : {}),
  };
  const tools = toolsOf(context);
  return { tools, handle: createHandler(tools, info, INSTRUCTIONS) };
};
