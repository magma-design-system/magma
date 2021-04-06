# Maggioli Design System

This repo contains [Maggioli Design System][docs].

[docs]: https://design-system.maggiolicloud.it/

---

### Installation

Clone the private repository form Git:

```
git clone https://git.maggioli.it/ricerca-sviluppo-new-media/design-system.git
```

Install needed node dependencies:

```
npm install -g npx
npm install -g yarn
```

Then run `yarn install` from project root:

```
yarn install
npx nx run-many --all --target=build
yarn install
npx nx run affected:build
```

Then you can run for every project:

```
npx nx run react:start
```

