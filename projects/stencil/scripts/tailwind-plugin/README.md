# tailwind-plugin (vendored)

Stencil build plugin that integrates [Tailwind CSS](https://tailwindcss.com/) v4
(CSS-based configuration) with the Stencil compiler. It is an adapted, vendored
copy of [`stencil-tailwind-plugin`](https://github.com/Poimen/stencil-tailwind-plugin)
by Richard Shephard (MIT - see [`LICENSE`](./LICENSE)).

## Why it lives here

Instead of depending on the published npm package, the plugin source is consumed
**directly** by the Stencil config. The standalone packaging (build/tsup, tests,
lint and publish scaffolding) has been removed; only the runtime source under
`src/` is kept. This lets us patch the plugin in place without a publish cycle.

## Usage

It is imported as plain TypeScript from the Stencil config:

```ts
// stencil.config.ts
import tailwind, { PluginConfigurationOptions } from './scripts/tailwind-plugin/src';
```

The named exports are unchanged from upstream: `tailwind` (default),
`tailwindHMR`, `tailwindGlobal`, `setPluginConfigurationDefaults`, `PluginOptions`
and the `PluginConfigurationOptions` / `TailwindConfig` types.

## Runtime dependencies

The plugin relies on packages declared in the Stencil project `package.json`
(`projects/stencil`): `@tailwindcss/postcss`, `tailwindcss`, `typescript`,
`postcss`, `postcss-load-config`, `postcss-combine-duplicated-selectors`,
`postcss-combine-media-query`, `postcss-discard-comments`, `cssnano`, `chalk`,
`fs-extra` and `p-queue`. Keep them in sync if you change the imports under `src/`.
