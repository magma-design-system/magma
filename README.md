
# Tintoretto
## Maggioli design system draft

---

### React library

This design system is based on [React][react] and [Storybook][storybook], you can see it on [Maggioli design system][storybook-online] website.

### Installation

If you already have node installed on your system, we strongly recommend to use [nvm][nvm] to handle multiple node versions on the same system, and so the right version for this project.

Onece you have **nvm** installed, go to this directory and open terminal:

```
$ nvm use
```

This should install the right version of node, based on the version specs inside the file `.nvmrc`. If this doesn't work, run:

```
$ nvm install v10.16.0
```

This will install manually the right node version.

### Project setup

Install node packages first to run node commands

```
$ npm install
```

---

## Project development

Once node packages are installed, run storybook to see the current status of the design system and continue your development.

```
$ npm run storybook
```

### Design tokens

The SCSS vars of the component library are based on design tokens located in `design-tokens` folder. These vars must be built first or the storybook build will break for some missing SCSS files. To avoid this or just update vars, run:

```
$ npm run design-tokens
```

---

#### IDE plugins

If you are using [Visual Studio Code][vsc], please consider to install [glen-84.sass-lint][vsc-sass-lint] and standard for runtime code linting based on project rules.


[nvm]: https://github.com/nvm-sh/nvm
[react]: https://reactjs.org/
[storybook-local]: http://localhost:51230/
[storybook-online]: https://designsystem.maggioli.it
[storybook]: https://storybook.js.org/
[vsc-sass-lint]: https://marketplace.visualstudio.com/items?itemName=glen-84.sass-lint
[vsc]: https://code.visualstudio.com/
