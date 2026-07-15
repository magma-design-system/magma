# Maggioli Design System

This repo contains [Maggioli Design System][docs].

[docs]: https://design-system.maggiolicloud.it/

---

## Requirements

- Node.js `>= 22.15.0` (see `engines` in `package.json`)
- Yarn (classic)

```
npm install -g eslint nx yarn
```

> Note: if you are using NVM and you change the node version, you must reinstall global packages for the current version you are using.

## Setup from a fresh clone

Clone the repository:

```
git clone git@github.com:magma-design-system/magma.git
```

Install the dependencies from the project root:

```
yarn install
```

Build all the projects **before** starting anything else:

```
nx run-many --target=build --all
```

> ⚠️ This step is mandatory on a fresh clone. The `stencil` project imports the build outputs (`dist/`) of its sibling workspace packages (`design-tokens`, `styles`, `icons`, `svg-icons`). If you skip it, Storybook fails to compile with errors like `Can't resolve '@maggioli-design-system/styles/dist/css/reset.css'` or `Can't resolve '../dist/esm/loader'` — and since the `storybook.start` script backgrounds Storybook, the errors are easy to miss: the symptom is just an empty `http://localhost:6006/`.

Then start the development environment (Storybook + Stencil watch build):

```
nx run stencil:storybook.start
```

Storybook is served at [http://localhost:6006](http://localhost:6006).

### Build single project

```
nx run design-tokens:build
nx run styles:build
nx run icons:build
nx run stencil:build --skip-nx-cache
```

If you want to test your nx build without cache, use `--skip-nx-cache` to avoid it. Be aware this command will SLOW build time.

### Troubleshooting

- **`http://localhost:6006/` is empty / connection refused** — the workspace packages are probably not built. Stop the dev server, run `nx run-many --target=build --all`, then start again.
- **Stencil build fails with a missing `assets/svg/...` file** — the generated icon assets are stale or missing. Regenerate them from `projects/stencil` with `npm run build.icons` (also run automatically by `storybook.start`).

## Development

Using VSCode you should install at least ESLint plugin by Dirk Baeumer and configure the editor properly:
create the file `.vscode/settings.json` with the following content:

```json
{
  "eslint.workingDirectories": [
    { "pattern": "./projects/*/" }
  ]
}
```
