# install SPEC.md

## Purpose

Entry point for installing Magma in a consumer application. Read this first, pick
your integration target, then follow the matching track. All three tracks share the
same asset setup (styles, fonts, icons, identity), documented once in
[`assets.md`](assets.md) - the canonical source of truth. The per-target files only
add package install and component registration.

This spec is written for agents and developers integrating Magma **into another
project**. It is not about building the monorepo itself (for that see
[`../../AGENTS.md`](../../AGENTS.md)).

## Pick your target

```
Are you using a framework?
├── No  -> plain HTML / vanilla JS / any framework via custom elements
│         => web-components.md   (@maggioli-design-system/magma)
├── React / Next.js
│         => react.md            (@maggioli-design-system/magma-react)
└── Angular (>= 18.2)
          => angular.md          (@maggioli-design-system/magma-angular)
```

| Target | Package | Track |
| ------ | ------- | ----- |
| Plain HTML / vanilla JS | `@maggioli-design-system/magma` | [`web-components.md`](web-components.md) |
| React / Next.js | `@maggioli-design-system/magma-react` | [`react.md`](react.md) |
| Angular >= 18.2 | `@maggioli-design-system/magma-angular` | [`angular.md`](angular.md) |

> Every track also requires the shared assets in [`assets.md`](assets.md). The track
> files tell you when to jump there.

## Version compatibility matrix

The wrapper packages follow the same major version as `magma`. Pin
`design-tokens` and `styles` to the versions matching your `magma` major.

| magma (and magma-react / magma-angular) | design-tokens | styles |
| --------------------------------------- | ------------- | ------ |
| `1.x` (before Magma 2) | `13.x` (latest `13.7.2`) | `15.x` (latest `15.11.1`) |
| `2.x` and later | `>= 14` | `>= 16` |

Always install `magma`, `magma-react`/`magma-angular`, `design-tokens` and `styles`
from the same compatibility row. Mixing rows produces missing tokens and broken
styles.

## What every consumer needs

Regardless of target, a working integration is the sum of four things:

1. **Styles** - color tokens, reset, globals, base, anti-FOUC, in cascade-layer order
2. **Fonts** - Karla, Merriweather, Roboto, Roboto Mono (via `@fontsource`)
3. **Icons** - the SVG library copied to a static path + `mdsIconSvgPath` set at runtime
4. **Component registration** - the only step that differs per target

Steps 1-3 are identical everywhere and live in [`assets.md`](assets.md). Step 4 is
the body of each track file.

## See also

- [`assets.md`](assets.md) - shared styles / fonts / icons / identity setup (canonical)
- [`../../projects/styles/SPEC.md`](../../projects/styles/SPEC.md) - full styles, Tailwind, dark mode, preferences
- [`../ARCHITECTURE.md`](../ARCHITECTURE.md) - monorepo and sub-project overview
- [`../../projects/stencil/SPEC.md`](../../projects/stencil/SPEC.md) - component conventions, icons, accessibility
