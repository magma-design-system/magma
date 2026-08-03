# install angular.md

## Purpose

Install Magma in an Angular app (>= 18.2) via the Angular wrapper
`@maggioli-design-system/magma-angular`, which exposes the `mds-*` components as
Angular standalone components.

First do the shared asset setup in [`assets.md`](assets.md) (styles, fonts, icons).
This file only covers package install and Angular-specific registration.

## 1. Install

```bash
npm i @maggioli-design-system/magma-angular @maggioli-design-system/magma
```

Peer dependencies: `@angular/common` and `@angular/core` `^18.2.0`. `magma-angular`
follows the same major version as `magma` (see [`SPEC.md`](SPEC.md) matrix). Then
install the assets from [`assets.md`](assets.md):

```bash
npm i @maggioli-design-system/styles @maggioli-design-system/design-tokens @maggioli-design-system/svg-icons
npm i @fontsource/karla @fontsource/merriweather @fontsource/roboto @fontsource/roboto-mono
```

## 2. Register the components

The `mds-*` proxies are Angular standalone components. Import the ones you use -
each registers its own custom element on load, so there is nothing else to wire up:

```typescript
import { MdsButton, MdsIcon } from '@maggioli-design-system/magma-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [MdsButton, MdsIcon],
})
export class AppComponent {}
```

Then use them in templates like native elements:

```html
<mds-button variant="primary" tone="strong">Save</mds-button>
<mds-icon name="action-email-send"></mds-icon>
```

For Reactive Forms, import the matching `ControlValueAccessor` alongside the
component (`TextValueAccessor` for `mds-input` / `mds-input-date`,
`SelectValueAccessor` for `mds-input-select`, `NumericValueAccessor` for
`mds-input-range`, `BooleanValueAccessor` for `mds-input-switch`).

### `MagmaModule` (convenience)

`MagmaModule` re-exports every proxy and every value accessor at once, so you do
not have to list them. With an AOT build it stays tree-shakeable - the Angular
compiler keeps only the directives a template actually matches - but the explicit
per-component imports above are still preferable: they say what the component
uses, and they do not depend on the compiler doing the pruning.

```typescript
import { MagmaModule } from '@maggioli-design-system/magma-angular';

@NgModule({
  imports: [/* ..., */ MagmaModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

`MagmaModule.forRoot()` is deprecated and now a no-op. Drop the call - and the
`importProvidersFrom(...)` around it, if you had one. It used to invoke
`defineCustomElements()` from the lazy loader, which is redundant (the standalone
proxies self-register) and expensive: on a probe app it took the build from
229 kB in 2 files to 1.9 MB in 142, because the loader pulls the runtime chunks
of all 114 components.

## 3. Set the icon path

Set `mdsIconSvgPath` once at app startup, before the first `mds-icon` renders - e.g.
in the root component constructor or an `APP_INITIALIZER`:

```typescript
sessionStorage.setItem('mdsIconSvgPath', '/svg/');
```

For Angular Universal (SSR), guard against the server where `sessionStorage` is
undefined - set it inside a browser-platform check (`isPlatformBrowser`) or in a
client-only initializer.

## 4. Serve the icon SVGs and styles

- Copy `@maggioli-design-system/svg-icons/dist/svg/` to the served `/svg/` path. With
  the Angular CLI, add an `assets` glob in `angular.json`:

  ```json
  "assets": [
    {
      "glob": "**/*.svg",
      "input": "node_modules/@maggioli-design-system/svg-icons/dist/svg",
      "output": "/svg"
    }
  ]
  ```

- Import the global CSS block from [`assets.md`](assets.md) in `styles.css` /
  `styles.scss` so the cascade-layer order is preserved.

## Gotchas

- Use the generated proxies rather than raw custom elements. If you ever use `mds-*`
  tags without importing the matching proxy, add `CUSTOM_ELEMENTS_SCHEMA` to the
  module/component so Angular does not error on unknown elements - but the proxies are
  the supported path, and skipping them also skips the custom element registration.
- Keep `magma` and `magma-angular` on the exact same version; the wrapper is
  generated against a specific `magma` build.
- Custom events (`mdsButtonClick`, ...) bind via the wrapper's Angular outputs - see
  [`../../projects/stencil/SPEC.md`](../../projects/stencil/SPEC.md) for event names.

## See also

- [`assets.md`](assets.md) - styles / fonts / icons / identity (canonical)
- [`../../projects/stencil/SPEC.md`](../../projects/stencil/SPEC.md) - component conventions, events, slots
