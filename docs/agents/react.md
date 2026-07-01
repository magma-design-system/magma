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

## Gotchas

- The icon path effect must run on the client. In Next.js App Router the wrapper that
  sets it must carry `'use client'`.
- Components used in Server Components render as custom elements but only hydrate on
  the client - interactive props/events work after hydration.
- Keep `magma` and `magma-react` on the exact same version; the wrapper is generated
  against a specific `magma` build.

## See also

- [`assets.md`](assets.md) - styles / fonts / icons / identity (canonical)
- [`../../projects/stencil/SPEC.md`](../../projects/stencil/SPEC.md) - component conventions, events, slots
