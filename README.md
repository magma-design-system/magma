# Maggioli Design System

This repo contains [Maggioli Design System][docs].

[docs]: https://design-system.maggiolicloud.it/

---

## Installation

Clone the repository from GitHub:

```
git clone git@github.com:magma-design-system/magma.git
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

```
nx run-many --target=build --all --skip-nx-cache
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
nx run stencil:storybook.start --skip-nx-cache
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

## CI and release of the v1.x support line

The `support/v1.x` branch is the maintenance line of `@maggioli-design-system/magma` 1.x. Its GitHub Actions workflows live in [.github/workflows](.github/workflows):

- **`stencil v1.x`** (`stencil.yml`, every push and pull request to `support/v1.x`): builds `magma`, `magma-react` and `magma-angular`, runs the stencil e2e tests and checks that the three manifests stay on major 1.
- **`publish v1.x`** (`publish.yml`, manual): releases and publishes the three packages to npm.

The two files have the same path as the `stencil` and `publish` workflows of `dev`, so the *Actions* sidebar lists them once, under the `dev` names: the runs of this line are told apart by their `v1.x` name. The `publish.yml` file name in particular cannot change, being registered on npm as the trusted publisher of the packages.

Only `magma`, `magma-react` and `magma-angular` are published from this line: the other workspace packages and the single components are not, and Storybook is not deployed.

### Publishing a release

From the *Actions* tab pick the `publish` workflow (the sidebar entry keeps the `dev` name, see above), *Run workflow*, select the `support/v1.x` branch and the bump to apply (`patch` or `minor`), or from the CLI (by file name: `gh` resolves workflow names from the default branch):

```
gh workflow run publish.yml --ref support/v1.x -f bump=patch
```

The workflow:

1. refuses to run from any branch other than `support/v1.x`; waits for the `stencil v1.x` CI of the branch head if it is still running and requires it to be green, tests included (a failed or cancelled CI fails the release);
2. bumps `projects/stencil/package.json` and, following it, `projects/stencil/react/package.json` (same version) and `projects/stencil/angular/magma-angular/package.json` (`1.0.0-beta.<magma version>`, e.g. magma `1.12.1` → magma-angular `1.0.0-beta.1.12.1`), including their dependency on `magma`. The line is locked to major 1: a manifest set to any other major (e.g. `2.0.0`) fails both the CI and the release. The new versions must not exist on npm and must be newer than the current `latest` ones, so a manifest edited by hand to an older version fails the release instead of moving `latest` backwards;
3. builds the three packages, commits `chore(release): magma@<version>`, tags `magma@<version>` and creates the GitHub release;
4. publishes `magma`, `magma-react` and `magma-angular` to npm (dist-tag `latest`) with [npm trusted publishing](https://docs.npmjs.com/trusted-publishers), so no npm token is needed.

If a publish job fails after the release commit was pushed, re-run the failed jobs: packages already on npm are skipped.
