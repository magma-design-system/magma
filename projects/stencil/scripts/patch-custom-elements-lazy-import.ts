/**
 * Restore the bundler magic comments on the lazy-chunk dynamic import inside
 * the dist-custom-elements output.
 *
 * With `externalRuntime: false` + a `dist-hydrate-script` target, the bundled
 * runtime keeps the `loadModule` branch (needed by `hydrateClientSide`), whose
 * dynamic import carries webpackInclude/webpackExclude/webpackMode/@vite-ignore
 * magic comments in the Stencil source.
 *
 * Those comments make webpack restrict its context module to `*.entry.js`
 * files — none exist in dist/components, so the context stays empty and
 * harmless. `minifyJs: true` (terser) strips all comments, so consumer webpack
 * builds (e.g. Next.js) try to bundle every file in the folder, including
 * .d.ts, and fail. This script re-inserts the comments after the build.
 * The import itself is dead at runtime here: custom elements have no
 * $lazyBundleId$, so the branch is never taken.
 */
import fs from 'fs';
import path from 'path';
import { DIST_DIR } from './meta';

const COMPONENTS_DIST = path.join(DIST_DIR, 'components');
const MAGIC =
  'import(/* webpackInclude: /\\.entry\\.js$/ */ /* webpackExclude: /\\.system\\.entry\\.js$/ */ /* webpackMode: "lazy" */ /* @vite-ignore */ `./${';
const BARE = 'import(`./${';

const main = (): void => {
  if (!fs.existsSync(COMPONENTS_DIST)) {
    console.error(`missing ${COMPONENTS_DIST} - run the stencil build first`);
    process.exitCode = 1;
    return;
  }

  let patchedFiles = 0;
  for (const entry of fs.readdirSync(COMPONENTS_DIST)) {
    if (!entry.endsWith('.js')) continue;
    const file = path.join(COMPONENTS_DIST, entry);
    const source = fs.readFileSync(file, 'utf8');
    if (!source.includes(BARE)) continue;
    fs.writeFileSync(file, source.replaceAll(BARE, MAGIC), 'utf8');
    patchedFiles += 1;
  }

  if (patchedFiles === 0) {
    // Not finding the pattern means Stencil changed the emitted code: verify
    // whether the patch is still needed before silently dropping it.
    console.warn(
      'patch-custom-elements-lazy-import: no bare dynamic import found - ' +
        'check whether the Stencil runtime still needs this patch',
    );
    return;
  }
  console.info(`patched lazy-import magic comments in ${patchedFiles} file(s)`);
};

main();
