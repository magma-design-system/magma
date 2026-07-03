# install angular.md

## Purpose

Install Magma in an Angular app (>= 18.2) via the Angular wrapper
`@maggioli-design-system/magma-angular`, which exposes the `mds-*` components as
Angular directives through `MagmaModule`.

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

### NgModule app

```typescript
import { MagmaModule } from '@maggioli-design-system/magma-angular';

@NgModule({
  imports: [
    // ...,
    MagmaModule.forRoot(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### Standalone app

Import `MagmaModule` in the standalone component:

```typescript
import { MagmaModule } from '@maggioli-design-system/magma-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [/* ..., */ MagmaModule],
})
export class AppComponent implements OnInit {}
```

And provide the module config in `app.config.ts`:

```typescript
import { importProvidersFrom, ApplicationConfig } from '@angular/core';
import { MagmaModule } from '@maggioli-design-system/magma-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...,
    importProvidersFrom(MagmaModule.forRoot()),
  ],
};
```

Use the components in templates like native elements:

```html
<mds-button variant="primary" tone="strong">Save</mds-button>
<mds-icon name="action-email-send"></mds-icon>
```

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

- Use the `MagmaModule` directives rather than raw custom elements. If you ever use
  `mds-*` tags without the wrapper, add `CUSTOM_ELEMENTS_SCHEMA` to the
  module/component so Angular does not error on unknown elements - but the wrapper is
  the supported path.
- Keep `magma` and `magma-angular` on the exact same version; the wrapper is
  generated against a specific `magma` build.
- Custom events (`mdsButtonClick`, ...) bind via the wrapper's Angular outputs - see
  [`../../projects/stencil/SPEC.md`](../../projects/stencil/SPEC.md) for event names.

## See also

- [`assets.md`](assets.md) - styles / fonts / icons / identity (canonical)
- [`../../projects/stencil/SPEC.md`](../../projects/stencil/SPEC.md) - component conventions, events, slots
