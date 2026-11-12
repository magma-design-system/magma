/*
  Where the project is: the folder the tools that look at the project read and resolve from
  (check_setup, check_markup, render_preview, the product layer of get_pattern), chosen once by
  the command and shared by every tool (#1387). The order, each step with the source that
  decides it ("Where each answer comes from" in ../README.md):

  1. `--root`, when the client names the folder.
  2. The folder the client starts the server in, when its package.json declares
     @maggioli-design-system/magma: every install track of the guides installs it
     (agents/web-components.md, react.md, angular.md, step 1), so it is a Magma project.
  3. The project the command runs magma from: the folder above the outermost `node_modules` of
     the path the client started (`process.argv[1]`, which node keeps as given, the symlinks of
     npm's `.bin` and of pnpm's store unresolved, where `import.meta.url` is the real file),
     when it lies inside the start folder and declares magma. A client opens a workspace and
     starts its servers there (`.mcp.json` at its root for Claude Code), so a project inside it
     is one of its projects, as a lab in `tools/asset_lab` of a repository; an install outside
     it (a global install, the cache of `npx -p` or of `pnpm dlx`) says nothing about it.
  4. Otherwise the start folder, as before: check_setup says it has no package.json.
*/
import path from 'node:path';
import { readJsonFile } from './context.js';

/** How the command found the project: `--root`, the start folder, or where magma runs from. */
export type RootFrom = 'option' | 'start' | 'install';

/** The package every install track installs, and the one that ships this server. */
const MAGMA = '@maggioli-design-system/magma';

/**
 * The file the `magma-mcp` bin of magma runs, inside the package (`bin` of its package.json,
 * held by test/shipped.test.ts): a client may name it instead of the bin (#1387).
 */
export const BIN_FILE = 'dist/mcp/cli.js';

/** The folder has a package.json that declares magma, as a dependency or a dev dependency. */
export const declaresMagma = (dir: string): boolean => {
  const manifest = readJsonFile<{
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  }>(path.join(dir, 'package.json'));
  return Boolean(manifest?.dependencies?.[MAGMA] ?? manifest?.devDependencies?.[MAGMA]);
};

/**
 * The folder above the outermost `node_modules` of an absolute path: the project that
 * installed what the path names. The outermost, because pnpm's store
 * (`node_modules/.pnpm/<package>/node_modules/...`) and a nested install sit inside the
 * project's own `node_modules`. Undefined when the path has none (a checkout, Yarn PnP).
 */
export const installedIn = (file: string): string | undefined => {
  const parts = path.resolve(file).split(path.sep);
  const index = parts.indexOf('node_modules');
  return index > 0 ? parts.slice(0, index).join(path.sep) || path.sep : undefined;
};

/** `dir` is `parent` or a folder inside it. */
const within = (dir: string, parent: string): boolean => {
  const relative = path.relative(parent, dir);
  return relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
};

/**
 * The project the tools look at, and how it was found, from `--root` (`option`), the folder
 * the client started the server in (`start`) and the file it started (`entry`).
 */
export const projectRoot = ({
  option,
  start,
  entry,
}: {
  option?: string;
  start: string;
  entry?: string;
}): { root: string; rootFrom: RootFrom } => {
  if (option) return { root: path.resolve(start, option), rootFrom: 'option' };
  if (declaresMagma(start)) return { root: start, rootFrom: 'start' };
  const installed = entry ? installedIn(path.resolve(start, entry)) : undefined;
  if (installed && within(installed, start) && declaresMagma(installed))
    return { root: installed, rootFrom: 'install' };
  return { root: start, rootFrom: 'start' };
};
