# MagmaReact

Magma React specific building blocks on top of [@maggioli-design-system/magma](https://www.npmjs.com/package/@maggioli-design-system/magma) components.

## Compatibility

`magma-react` follows the same major version as `magma`. Use the versions of `@maggioli-design-system/design-tokens` and `@maggioli-design-system/styles` matching your magma major version:

| magma | design-tokens | styles |
| :--- | :--- | :--- |
| `1.x` (before Magma 2) | `13.x` (latest `13.7.2`) | `15.x` (latest `15.11.1`) |
| `2.x` and later | `>= 14` | `>= 16` |

## Installation

Install package
```
npm i @maggioli-design-system/magma-react
```

### Icon
Set the path where the `mds-icon` component will get the svg icons inside `UseEffect` otherwise window is not defined

```ts
// app.js

export default function App({
  children,
}) {
  useEffect(() => {
    sessionStorage.setItem("mdsIconSvgPath", `/svg/`);
  }, []);

  return <>{children}</>;
}
```

Example using Nextjs with App Router

```tsx
// client_globals_wrapper.tsx
export default function ClientGlobalsWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    sessionStorage.setItem("mdsIconSvgPath", `/svg/`);
  }, []);

  return <>{children}</>;
}
```

```ts
// app/layout.tsx

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

## Usage Example

```tsx
import { MdsText } from '@maggioli-design-system/magma-react'


export default function Component() {
  return (
    <MdsText typography="h3">Hello World</MdsText>
  );
}
```

