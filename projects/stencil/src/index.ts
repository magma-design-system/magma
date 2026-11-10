/**
 * The entry point of `@maggioli-design-system/magma` that holds no component: the services that
 * configure the components from code, and the types of the components.
 *
 * - `IconsSetService.setSvgPath()` sets the base path of the icon SVG files in memory, without
 *   `sessionStorage`, and makes every mounted `<mds-icon>` load its icon again (#521)
 * - `NavigationService.setHandler()` registers the client-side router once, so that every
 *   component link (`href` of `mds-button`, `mds-tab-item`, ...) is routed on the client
 *   without a click listener per link
 *
 * ```ts
 * import { IconsSetService, NavigationService } from '@maggioli-design-system/magma';
 * IconsSetService.setSvgPath('/assets/svg/');
 * NavigationService.setHandler((href) => router.push(href));
 * ```
 *
 * The package root (`.`) and `./services` serve this same module. The guides give the root:
 * TypeScript finds its types under every `moduleResolution`, while a subpath of `exports` needs
 * one that reads that field (`node16`, `nodenext`, `bundler`; `node10` ignores it, TypeScript
 * "Modules - Reference", "The moduleResolution compiler option"). `./services` stays for the
 * code written against it.
 *
 * Both services keep their state on `globalThis`, so every bundled copy of a service agrees on
 * it, and neither touches `window` while the module loads: a server can import them (the
 * spec next to this file loads it in plain Node).
 *
 * The types of the components (`Components`, `JSX`, the `Mds*CustomEvent` types, the event
 * details) are re-exported as types only, as the Stencil component starter does in its
 * `src/index.ts`: they were the types of the root before this module took its place
 * (`dist/types/components.d.ts`), and no component reaches the runtime of this entry.
 */
export type * from './components';
export { IconsSetService } from './components/mds-icon/services/icons-set.service';
export { NavigationService } from './common/navigation';
export type { NavigationHandler } from './common/navigation';
