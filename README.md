# Maggioli Design System

This repo contains [Maggioli Design System][docs].

[docs]: https://design-system.maggiolicloud.it/

---

## Installation

Clone the private repository form Git:

```
git clone git@gitlab.com:maggiolispa/ricerca-sviluppo-new-media/design-system.git
```

Install needed node dependencies:

```
npm install -g eslint nx yarn
```

> Note: if you are using NVM and you change the node version, you must reinstall global packages for the current version you are using.

Then run `yarn install` from project root:

```
yarn install
```

### Build all

Warning, this will take 1 hour (90% of the time by `identity`)

```
nx run-many --all --target=build --skip-nx-cache
```

### Build single project

```
nx run design-tokens:build
nx run styles:build
nx run icons:build
nx run stencil:build --skip-nx-cache
```

If you want to test your nx build without cache, use `--skip-nx-cache` to avoid it. Be aware this command will SLOW build time.

Then you can run for every project:

```
npx nx run stencil:storybook.start --skip-nx-cache
```

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
