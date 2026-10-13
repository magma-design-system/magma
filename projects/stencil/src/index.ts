/**
 * Public, non-component entry point for `@maggioli-design-system/magma`.
 *
 * Exposed through the `./services` subpath export so consumers can configure the
 * components programmatically:
 *
 * - `IconsSetService.setSvgPath()` sets the icon SVG base path without relying on
 *   `sessionStorage`, and re-fetches all mounted `<mds-icon>` instances
 * - `NavigationService.setHandler()` registers the client-side router once, so that every
 *   component link (`href` of `mds-button`, `mds-tab-item`, ...) is routed on the client
 *   without a click listener per link
 *
 * ```ts
 * import { IconsSetService, NavigationService } from '@maggioli-design-system/magma/services';
 * IconsSetService.setSvgPath('/assets/svg/');
 * NavigationService.setHandler((href) => router.push(href));
 * ```
 *
 * Both keep their state on `globalThis`, so every bundled copy of a service agrees on it.
 */
export { IconsSetService } from './components/mds-icon/services/icons-set.service';
export { NavigationService } from './common/navigation';
export type { NavigationHandler } from './common/navigation';
