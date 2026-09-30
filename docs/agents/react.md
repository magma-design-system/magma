# install react.md

## Purpose

Install Magma in a React or Next.js app via the React wrapper
`@maggioli-design-system/magma-react`. The wrapper exposes typed React components
(`MdsButton`, `MdsText`, ...) over the underlying custom elements.

First do the shared asset setup in [`assets.md`](assets.md) (styles, fonts, icons).
This file only covers package install and React-specific registration.

## 1. Install

```bash
npm i @maggioli-design-system/magma-react @maggioli-design-system/magma
```

`magma-react` follows the same major version as `magma` (see [`SPEC.md`](SPEC.md)
matrix). Then install the assets from [`assets.md`](assets.md):

```bash
npm i @maggioli-design-system/styles @maggioli-design-system/design-tokens @maggioli-design-system/svg-icons
npm i @fontsource/karla @fontsource/merriweather @fontsource/roboto @fontsource/roboto-mono
```

## 2. Use the components

Import directly from the wrapper - no `defineCustomElements()` call is needed, the
React components register their custom element on import:

```tsx
import { MdsText, MdsButton } from '@maggioli-design-system/magma-react';

export default function Component() {
  return (
    <>
      <MdsText typography="h3">Hello World</MdsText>
      <MdsButton variant="primary" tone="strong">Save</MdsButton>
    </>
  );
}
```

The package root is a barrel of pure re-exports and the package declares
`sideEffects: false`, so importing from it is already tree-shakeable - only the
components you name reach the bundle. Deep imports are available as an escape
hatch for bundlers that ignore `sideEffects`:

```tsx
import { MdsButton } from '@maggioli-design-system/magma-react/mds-button.js';
```

The per-component event types (`MdsButtonEvents`, ...) live in those per-component
modules, not in the root barrel - import them from the deep path.

## 3. Set the icon path

`window` / `sessionStorage` are not available during SSR, so set the icon path in a
client effect, once, near the app root:

```tsx
import { useEffect } from 'react';

export default function App({ children }) {
  useEffect(() => {
    sessionStorage.setItem('mdsIconSvgPath', '/svg/');
  }, []);

  return <>{children}</>;
}
```

### Next.js (App Router)

Put the effect in a Client Component and mount it in the root layout:

```tsx
// client-globals-wrapper.tsx
'use client';
import { useEffect } from 'react';

export default function ClientGlobalsWrapper({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  useEffect(() => {
    sessionStorage.setItem('mdsIconSvgPath', '/svg/');
  }, []);

  return <>{children}</>;
}
```

```tsx
// app/layout.tsx
import ClientGlobalsWrapper from './client-globals-wrapper';

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html>
      <body>
        <ClientGlobalsWrapper>
          <main>{children}</main>
        </ClientGlobalsWrapper>
      </body>
    </html>
  );
}
```

## 4. Serve the icon SVGs and styles

- Copy `@maggioli-design-system/svg-icons/dist/svg/` into the static folder served at
  `/svg/` (Vite/CRA: `public/svg/`; Next.js: `public/svg/`). Match the path you pass
  to `mdsIconSvgPath`.
- Import the global CSS block from [`assets.md`](assets.md) in your global stylesheet
  (`app/globals.css`, `src/index.css`, ...) so the cascade-layer order is preserved.

## 5. Server-side rendering (Next.js)

Every component ships in two variants:

- `@maggioli-design-system/magma-react` (or `…/mds-button.js`) — the client
  wrapper. During SSR it emits a bare `<mds-button>` tag with **no** attributes,
  shadow DOM or geometry: the page shifts when the component hydrates.
- `@maggioli-design-system/magma-react/mds-button.server.js` — the SSR wrapper.
  On the server it runs `renderToString` from `@maggioli-design-system/magma/hydrate`
  and emits the full markup — attributes, `<template shadowrootmode="open">` with
  the component styles, and the `hydrated` flag — so the HTML paints with its
  final geometry (CLS ≈ 0). On the client it delegates to the client wrapper.

In an SSR app, import the `.server` variant:

```tsx
import { MdsButton } from '@maggioli-design-system/magma-react/mds-button.server.js';
import { MdsText } from '@maggioli-design-system/magma-react/mds-text.server.js';

export default function Page() {
  return (
    <>
      <MdsText typography="h3">Hello World</MdsText>
      <MdsButton variant="primary" tone="strong">Save</MdsButton>
    </>
  );
}
```

SSR notes:

- There is no server barrel: import each component from its own
  `…/mds-<name>.server.js` module.
- The generated server wrappers carry a `'use client'` directive (an
  output-target quirk): in Next.js they behave as client components that are
  still server-rendered, which is exactly what produces the declarative shadow
  DOM in the initial HTML.
- Events are not wired on the server wrapper; they attach after hydration via
  the client wrapper it delegates to.
- Icons render empty server-side (the box is reserved, no layout shift) and the
  default theme is rendered — see the SSR section in
  [`web-components.md`](web-components.md).
- The hydrate module (`magma/hydrate`) bundles all 114 components (~3 MB,
  server-only). It is imported lazily behind a `typeof window` check and must
  never end up in a client bundle.

## Gotchas

- The icon path effect must run on the client. In Next.js App Router the wrapper that
  sets it must carry `'use client'`.
- Client wrappers used in Server Components render as custom elements but only hydrate
  on the client - use the `.server` variants (section 5) to get real SSR markup.
- Keep `magma` and `magma-react` on the exact same version; the wrapper is generated
  against a specific `magma` build.

## See also

- [`assets.md`](assets.md) - styles / fonts / icons / identity (canonical)
- [`../../projects/stencil/SPEC.md`](../../projects/stencil/SPEC.md) - component conventions, events, slots
