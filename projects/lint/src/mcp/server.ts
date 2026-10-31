/*
  The Magma MCP server: the twelve tools on the data of the installed magma, behind the protocol
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
import { getPattern } from './patterns.js';
import { createHandler, toolList, type Tool } from './protocol.js';
import { renderPreview } from './render.js';
import { explainClass, listTokens, suggestRole } from './tokens.js';

/** What the agent reads when it connects: when to reach for the server. */
export const INSTRUCTIONS = [
  'Magma is the design system of this project: web components (mds-*), tokens and Tailwind classes. The tools answer from the version installed here.',
  'Before writing a component, find it (find_component), read its API (get_component) and how your framework writes it (get_usage). Before a colour, a spacing or a class, ask list_tokens, suggest_role or explain_class: Magma spacing steps are hundredths of a rem (p-4 is 0.01rem, p-400 is 1rem).',
  'Before a flow that spans components (a message, a confirmation, an empty, a loading or a failed state), ask get_pattern: given the values of its variables it returns the case to follow, the same in every product; say when no pattern covers the task.',
  'How the parts of an interface stand together (the space between elements, and the other rules of the design language) is decided by the domains of Foundation, which get_pattern lists first (kind foundation): the answer of get_pattern for a situation names in rules the ones its case relies on, get_component the ones that govern the component; follow them, and read a domain with get_guide (its id, such as rhythm).',
  'Before an icon slug, check it with find_icon. After writing, check the snippet with check_markup. When the integration itself may be incomplete, run check_setup. For a rule or a setup step, read the section you need with get_guide.',
  'Before asking the user to decide on an interface, render each option with render_preview and show them the images, never words alone: the recommended option first, a way to flag an image, and a free answer that you render and show before acting on it (get_guide mcp, section "Show the person what you mean"). An image whose report is not representative is not shown as it is: fix the markup and render again, or say what is wrong in it.',
  'When you need something these tools do not answer (you had to read Magma files by hand or guess, or an answer carries gap), tell the user, and at the end of the task propose an issue on Magma, one per missing capability, as get_guide reporting describes (section "A tool or an answer the MCP server is missing"); open it only once the user agrees.',
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
    getPattern,
    checkMarkup,
    checkSetup,
    renderPreview,
  ].map((tool) => tool(context));

/**
 * The tools as data, the answer of `tools/list`: a definition reads nothing of the project, so
 * any context gives the same. The stencil build writes it into dist/lint/mcp/tools.json.
 */
export const toolsList = (context: ToolContext) => toolList(toolsOf(context));

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
      'The components, tokens, icons and guides of the Magma version installed in this project, its lint, and a render of its components.',
    websiteUrl: 'https://github.com/magma-design-system/magma',
    ...(icons.length ? { icons } : {}),
  };
  const tools = toolsOf(context);
  return { tools, handle: createHandler(tools, info, INSTRUCTIONS) };
};
