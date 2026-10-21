![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

# Maggioli Design System Web-Component

## To generate a new web-component:

```
nx run stencil:generate mds-component-name
```

## To build a web-component:

```
nx run stencil:build --skip-nx-cache
```

---

## Tests

All tests paths are from this project `design-system/projects/stencil/` path.

### Unit and browser tests

The tests run on [Vitest](https://vitest.dev) through
[`@stencil/vitest`](https://stenciljs.com/docs/testing-vitest), against the components built in
`www/` (see `vitest.config.mts`):

- `*.spec.ts` files are unit tests running in the mock-doc environment, without rendering components;
- `*.e2e.ts` files are component tests running in a real Chromium driven by Playwright.

```
nx run stencil:test        # build, then unit + browser tests
npm run test.spec          # unit tests only (needs a previous build)
npm run test.e2e           # browser tests only (needs a previous build)
npm run test.watch         # rebuild and rerun the tests on every change
```

The first run needs the Playwright browser: `npx playwright install chromium`.

A component test renders the markup and asserts on the live DOM; real user interactions go
through `userEvent`:

```ts
import { render } from '@stencil/vitest';
import { userEvent } from 'vitest/browser';

describe('mds-chip', () => {
  it('emits mdsChipDelete when the delete button is clicked', async () => {
    const { root, spyOnEvent, waitForChanges } = await render(
      '<mds-chip label="chip" deletable></mds-chip>',
    );
    const deleteSpy = spyOnEvent('mdsChipDelete');

    await userEvent.click(root.shadowRoot!.querySelector('.button-delete')!);
    await waitForChanges();

    expect(deleteSpy).toHaveReceivedEventTimes(1);
  });
});
```

Keep in mind that:

- the components are prebuilt, so the singletons imported from the sources (`preferenceStore`,
  ...) are not the ones the components use: drive them through the DOM (`<html lang>`, the
  `pref-*` classes, the `mds-pref-*` controllers, events and methods);
- the tests of a file share one browser page: reset the global state they touch in `beforeEach`
  (`src/test/setup.browser.ts` already clears `<html lang>`, the `pref-*` classes and the
  storages);
- `nx run stencil:generate` still scaffolds the Jest flavoured spec and e2e files: answer no and
  start from the snippet above.

#### Server-side rendering and hydration

The SSR consumers (the `magma-react` server wrappers, `renderToString` of `magma/hydrate`) render
the components on the server and hydrate that markup in the browser: a path that `render()` never
takes. `@test/ssr` runs it in the browser tests:

- `renderToString(html)` renders the markup in Node with the hydrate build (`dist/hydrate`,
  through the `renderToString` command of `vitest.config.mts`) and throws on its error
  diagnostics;
- `hydrate(markup, { hidden })` parses it into a new stage as a browser parses an SSR page
  (declarative shadow roots, hydration ids) and resolves once the components have hydrated it;
- `reveal(stage)` moves a hidden stage into a visible one, as React streaming reveals a Suspense
  boundary: every component in it is disconnected and connected again.

```ts
import { hydrate, renderToString } from '@test/ssr';

it('measures the actions once the server markup is hydrated', async () => {
  const stage = await hydrate(await renderToString('<mds-table>...</mds-table>'));
  const row = stage.querySelector('mds-table-row')!;
  // assert on the hydrated row
});
```

The command reads `dist/hydrate`, so these tests need a full build (`nx run stencil:test` runs
one). The server markup already carries the `hydrated` flag, which therefore says nothing about
the client: `hydrate` waits for `componentOnReady()` instead, and what the components do after
loading (observers, re-renders) still needs `expect.poll`.

### Storybook tests

The stories (`test/*.stories.tsx`) carry the visual, interaction and accessibility tests: `play`
functions (`expect` / `fn` from `storybook/test`, `canvas` / `userEvent` from the play context)
and the a11y addon, which runs axe on every story with `a11y.test: 'error'` (the `afterEach` in
`.storybook/preview.jsx` waits for the Stencil hydration before axe inspects the DOM). They run
as the `storybook` project of `vitest.config.mts` through
[`@storybook/addon-vitest`](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon),
in the same headless Chromium (Playwright) as the e2e tests:

```
npm run test-storybook                                  # every story: play functions + a11y checks
npm run test-storybook -- --run                         # one shot in a terminal too (CI is one shot by default)
npx vitest run --project storybook src/components/mds-button   # a subset
```

CI runs them in the test job of the stencil workflow (`.github/workflows/stencil.yml`, input
`run-storybook-tests` of the shared package pipeline), right after `npm run test`, against the dist
of the build artifact.

`nx run stencil:test` runs the `spec` and `browser` projects only; the stories are their own target
(`nx run stencil:test-storybook`). Story globs, aliases and PostCSS come from `.storybook/main.mjs`
(`viteFinal`), so the tests render exactly what Storybook renders. In watch mode the addon also
starts Storybook (`storybook dev -p 6006`) and links every failure to its story.

Two conventions keep the a11y run green without hiding anything. `color-contrast` runs with
`reviewOnFail` (`.storybook/preview.jsx`): the colours are design-tokens decisions, so its
violations land in the addon's "needs review" list instead of failing the story. A story whose
violation is a known component gap carries `parameters: { a11y: { test: 'todo' } }` next to a
`TODO a11y` comment naming the gap: axe still runs and reports it as a warning until the component
is fixed, then the parameter goes away.

### Type check

Neither Vitest nor the Stencil build type-checks the tests and the stories: Vitest strips the types,
and the build compiles `tsconfig.stencil.json`, which leaves them out. A target of its own runs
`tsc` on `tsconfig.json`, the program the editor sees (components, tests and stories):

```
nx run stencil:check.types     # tsc --noEmit -p tsconfig.json, after a build
```

It needs a previous build: `src/dictionary/icon.ts` imports `src/fixtures/icons.json` and the
iconsauce dictionary of svg-icons, both written by it. CI runs it in the `types` job of the stencil
workflow (`.github/workflows/stencil.yml`), on the build artifact, so an error the editor underlines
fails the pipeline. Run it on an install that matches `package-lock.json` (`npm ci`): before
`@stencil/vitest` 1.16 the legacy Jest matchers that `src/components.d.ts` pulls in from
`@stencil/core/internal` shadow its `toHaveAttribute(name, value?)`, and the check reports errors
that CI does not.

What it asks of a test or a story:

- give `render` the element type when the test reads a prop of the root:
  `render<HTMLMdsPrefModeElement>('<mds-pref-mode></mds-pref-mode>')`;
- the stories are typed with Stencil's JSX, so every `mds-*` tag is checked against its props, but
  React renders them: React's `key` on a function component is declared in
  `src/storybook/jsx.d.ts`; anything else that only React has, such as `event.nativeEvent`, needs a
  cast.

### Wrapper tests

The React and Angular wrappers are generated by the output targets of `stencil.config.ts` and have
their own tests, which check the contract promised to consumers by `docs/agents/react.md` and
`docs/agents/angular.md`. They run against this project's `dist/`: the nx targets build `stencil`
and the wrapper first.

```
nx run stencil-react:test      # Vitest: browser (Playwright Chromium) + node projects
nx run stencil-angular:test    # Vitest in jsdom through the Angular unit-test builder, once
```

- **React** (`projects/stencil-react/test/`, `vitest.config.mts`): the tests import the built
  package, `@maggioli-design-system/magma-react`, never `src/`, which every stencil build
  regenerates. `*.e2e.tsx` files run in the `browser` project and render the client wrappers with
  `@testing-library/react` against the real custom elements: props reaching the element
  properties, custom events reaching the handlers, `ref`, children and slots. `*.spec.ts(x)` files
  run in the `node` project, without `window`: the `<tag>.server.js` wrappers render through the
  hydrate module (attributes of the `properties` map, declarative shadow DOM), and every component
  of `dist/documentation.json` has its client and server module and its barrel export. The custom
  elements build has no `componentOnReady()`: wait for the `hydrated` attribute instead.
  `npm run test.watch` (from `projects/stencil-react`) keeps Vitest in watch mode.
- **Angular** (`projects/stencil-angular/magma-angular/src/lib/*.spec.ts`): module wiring, generated
  proxies (inputs, outputs, one custom element per proxy), `ControlValueAccessor` directives with
  Reactive Forms. The specs run with Vitest in jsdom through the Angular `unit-test` builder
  (`globals: true`, so `describe`, `it`, `expect` and `vi` need no import) against the real custom
  elements, which load and render in jsdom: wait for the `hydrated` attribute before asserting on
  the state of an element, since its watchers run only once it has loaded. The specs stay out of
  `stencil-generated/`, which the stencil build regenerates. See
  `projects/stencil-angular/README.md` for the watch mode.

CI runs both in the `magma-react` and `magma-angular` jobs of the stencil workflow
(`.github/workflows/stencil.yml`), on the build artifact of the `magma` job. Run them when a change
touches the output targets: their options in `stencil.config.ts`, a bump of
`@stencil/react-output-target` or `@stencil/angular-output-target`, a new component or a renamed
prop or event.
