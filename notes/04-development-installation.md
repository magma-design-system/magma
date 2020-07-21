
# Development installation

If you already have [node][node] installed on your system, if you need to use multiple node versions, depending on your projects, we strongly recommend to use [nvm][nvm] to handle multiple node versions on the same system, and so the right version for this project.

Once you have **nvm** installed, go to this directory and open terminal:

```
$ nvm use
```

This should install the right version of node, based on the version specs inside the file `.nvmrc`. If this doesn't work, run:

```
$ nvm install v14.5.0
```

This will install manually the right node version.

### Project setup

Install node packages first to run node commands

```
$ npm install
```

---

## Design System

#### Setup

Once node packages are installed, run storybook to see the current status of the design system and continue your development.

```
$ npm run dev:storybook
```

This will run [Storybook][storybook] on the [local URL][storybook-local].

#### Design tokens

The SCSS vars of the component library are based on design tokens located in `design-tokens` folder. These vars must be built first or the storybook build will break for some missing SCSS files. To avoid this or just update vars, run:

```
$ npm run tokens
```

---

#### IDE integration

The project supports various ide integrations with linter configs.



| Plug-in | Description | Supported IDE |
|:----------|:----------|:----------|
| [StyleLint](https://stylelint.io/) | Linter for CSS and SASS | [Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint), [Atom](https://atom.io/packages/linter-stylelint), [Sublime Text](https://github.com/SublimeLinter/SublimeLinter-stylelint) |
| [ES Lint](https://eslint.org/) | Linter for JavaScript | [Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) |


[addon-docs]: https://www.npmjs.com/package/@storybook/addon-docs
[mdx]: https://github.com/storybookjs/storybook/blob/next/addons/docs/docs/mdx.md
[nvm]: https://github.com/nvm-sh/nvm
[node]: https://nodejs.org/
[nexus-mgg]: http://nexus.maggioli.it:8081#browse/search/npm=group%3Dmaggioli
[react]: https://reactjs.org/
[gatsby]: https://www.gatsbyjs.org/
[storybook-local]: http://localhost:2046
[storybook-online]: https://designsystem.maggioli.it
[storybook]: https://storybook.js.org/
[vsc-sass-lint]: https://marketplace.visualstudio.com/items?itemName=glen-84.sass-lint
[vsc]: https://code.visualstudio.com/
