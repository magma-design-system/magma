/*
  Magma as an external vendor (docs/ARCHITECTURE.md, section 1): the pages of the studio load the
  components and their stylesheets from the Magma installed where the studio runs, never from its
  bundle. They load them as a render of the MCP server does (projects/lint, src/mcp/render.ts;
  "The page a render loads" in docs/CONTRACTS.md): the stylesheets of agents/assets.md in their
  layers, the lazy loader of the installed magma, the icons of the installed sets, each resolved by
  the same code.

  The plugin serves those three paths (the dev server and `vite preview`) and writes their tags
  into each page after Vite has processed it, so the build never bundles them: whoever hosts the
  built studio serves the same paths beside it. Beside them goes the version of that magma, in
  `<meta name="magma-version">`, which the bar of the studio shows: the Magma installed when the
  page is served, or the one a build is published with.
*/
import { createReadStream } from 'node:fs';
import path from 'node:path';
import type { Connect, Plugin } from 'vite';
import type { ToolContext } from '../lint/src/mcp/context.ts';
import {
  LAYERS,
  TYPES,
  fileOf,
  loaderOf,
  magmaVersion,
  stylesheetImports,
} from '../lint/src/mcp/render.ts';

/** The version of the installed magma for the bar of the studio; none when it cannot be read. */
const versionTag = (version: string | undefined) =>
  version
    ? [
        {
          tag: 'meta',
          attrs: { name: 'magma-version', content: version },
          injectTo: 'head' as const,
        },
      ]
    : [];

/** The paths a page loads Magma from, relative to the page: `fileOf` serves them. */
const VENDOR = /\/(components|svg|node_modules)\/.*$/;

/**
 * Where mds-icon fetches the icons (agents/assets.md, "Tell mds-icon where the icons are"):
 * `svg/` beside the page, set before the first icon renders.
 */
const ICON_SCRIPT = `try {
  sessionStorage.setItem('mdsIconSvgPath', new URL('svg/', document.baseURI).pathname);
} catch {
  /* storage blocked: the icons stay unset */
}`;

export function magmaVendor(root: string): Plugin {
  // the project the studio runs in: the packages resolve from its package.json up
  const context: ToolContext = { root, settings: {} };
  const serve: Connect.NextHandleFunction = (req, res, next) => {
    const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://studio').pathname);
    const match = VENDOR.exec(pathname);
    // anything else under node_modules (the dependencies Vite prebundles) is Vite's
    const file = match ? fileOf(context, match[0]) : undefined;
    if (!file) return next();
    res.setHeader('content-type', TYPES[path.extname(file)] ?? 'application/octet-stream');
    createReadStream(file).pipe(res);
  };
  return {
    name: 'magma-vendor',
    configureServer: (server) => {
      server.middlewares.use(serve);
    },
    configurePreviewServer: (server) => {
      server.middlewares.use(serve);
    },
    transformIndexHtml: {
      order: 'post',
      handler: () => [
        ...versionTag(magmaVersion(context)),
        {
          tag: 'style',
          children: [LAYERS, ...stylesheetImports(context, 'node_modules/')].join('\n'),
          injectTo: 'head-prepend',
        },
        { tag: 'script', children: ICON_SCRIPT, injectTo: 'head' },
        {
          tag: 'script',
          attrs: { type: 'module', src: `components/${path.basename(loaderOf(context))}` },
          injectTo: 'head',
        },
      ],
    },
  };
}
