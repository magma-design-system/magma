

# Maggioli design system

This design system is based on [React][react], [Storybook][storybook] and [Gatsby][gatsby], you can see it on [Maggioli design system][storybook-online] website.

The project is currently store in [nexus.maggioli.it][nexus-mgg] under `@maggioli` group.

---

### Installation

Install `node v14.x.x` with nvm and `npm 7.x.x` manually:

```
nvm use
npm install -g npm
```

Then launch:

```
npm install
npx nx run mgg-icons:build
npm install
npx nx affected:build
```

[adobe-leonardo]: (https://leonardocolor.io/)
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
