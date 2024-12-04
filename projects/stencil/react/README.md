# MagmaReact

Magma React specific building blocks on top of [@maggioli-design-system/magma](https://www.npmjs.com/package/@maggioli-design-system/magma) components.


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

