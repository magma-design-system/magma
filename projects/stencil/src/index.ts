/**
 * Public, non-component entry point for `@maggioli-design-system/magma`.
 *
 * Exposed through the `./services` subpath export so consumers can configure the
 * icon SVG base path programmatically, without relying on `sessionStorage`:
 *
 * ```ts
 * import { IconsSetService } from '@maggioli-design-system/magma/services';
 * IconsSetService.setSvgPath('/assets/svg/');
 * ```
 *
 * `setSvgPath()` updates the shared icon path (kept on `globalThis`, so every bundled
 * copy of the service agrees on it) and re-fetches all mounted `<mds-icon>` instances.
 */
export { IconsSetService } from './components/mds-icon/services/icons-set.service';
