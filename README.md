# Maggioli Design System

This repo contains [Maggioli Design System][docs].

[docs]: https://design-system.maggiolicloud.it/

---

### Installation

Install `node v14.x.x` with nvm and `npm 7.x.x` manually:
You just need to install from project root:

```
git clone https://git.maggioli.it/ricerca-sviluppo-new-media/design-system.git
```

You **must have NPM 7.x.x installed** and `npx` or `nx` will not work

```
npm install -g npm
npm install -g npx
```

Then launch:

```
npm install
npx nx run-many --all --target=build
npm install
npx nx run affected:build
```

Then you can run for every project:

```
npx nx run react:start
```

