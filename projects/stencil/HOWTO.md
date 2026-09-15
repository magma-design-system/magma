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
