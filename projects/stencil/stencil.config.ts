import alias from '@rollup/plugin-alias';
// import autoprefixer from 'autoprefixer'
import path from 'path';
import { Config } from '@stencil/core';
import { inlineSvg } from 'stencil-inline-svg';
import tailwind, { PluginConfigurationOptions } from './scripts/tailwind-plugin/src';
import { reactOutputTarget } from '@stencil/react-output-target';
import { angularOutputTarget } from '@stencil/angular-output-target';
import tokenFallbackPlugin from './scripts/postcss-token-fallbacks';
import { MIGRATED_TESTS } from './scripts/vitest-migrated';

const twConfigurationFn = () => {
  // remove tailwind preflight and add custom theme
  return `
  @layer reset, vendor, theme, base, components, utilities;
  @reference "tailwindcss/theme.css";
  @reference "tailwindcss/utilities.css";
  @reference "${path.resolve('./src/tailwind/', 'utilities.css')}";
  @reference "@maggioli-design-system/styles/dist/css/animations.css";
  @reference "@maggioli-design-system/styles/dist/tailwind/theme.css";
  @reference "@maggioli-design-system/styles/dist/tailwind/typography.css";
  `;
};

const opts: PluginConfigurationOptions = {
  injectTailwindConfiguration: twConfigurationFn,
};

const packageName = 'magma-components';
const srcDir = './src';

export const config: Config = {
  namespace: packageName,
  // globalStyle: `${srcDir}/globals.css`,
  hydratedFlag: {
    selector: 'attribute',
  },
  taskQueue: 'async',
  transformAliasedImportPaths: true,
  srcDir,
  // tsconfig dedicato che esclude le *.stories.tsx dal program TypeScript:
  // le storie restano nel tsconfig.json principale (editor, ESLint, paths di
  // Storybook) ma non vengono più compilate né copiate in dist/collection.
  tsconfig: 'tsconfig.stencil.json',
  sourceMap: false,
  minifyCss: false,
  minifyJs: true,
  buildEs5: true,
  extras: {
    enableImportInjection: true,
  },
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    angularOutputTarget({
      componentCorePackage: '@maggioli-design-system/magma',
      outputType: 'standalone',
      // I proxy standalone importano i custom element da
      // `<corePackage>/<customElementsDir>/<tag>.js`: deve puntare a
      // `dist/components` (come il react output target) per matchare l'export
      // `./dist/components/*.js`; il default `components` non esiste.
      customElementsDir: 'dist/components',
      // Emette le proprietà dei componenti inline sui proxy generati (con JSDoc)
      // invece che solo via interface merge: abilita type-check, tooltip e
      // navigazione degli attributi (es. variant, placeholder) dall'Angular
      // Language Service nei template. NB: opzione sperimentale.
      inlineProperties: true,
      // Come per React: un modulo ES per proxy (stencil-generated/<tag>.ts) più
      // un barrel di sole ri-esportazioni. Serve al tree-shaking anche dopo
      // l'appiattimento in FESM di ng-packagr.
      esModules: true,
      directivesProxyFile: './angular/magma-angular/src/stencil-generated/components.ts',
      directivesArrayFile: './angular/magma-angular/src/stencil-generated/index.ts',
      // Genera un ControlValueAccessor per i componenti input, così sono
      // usabili con formControlName/[formControl] nei Reactive Form Angular:
      // writeValue imposta la prop di valore (`value`, o `checked` per i
      // boolean), l'`event` propaga il valore letto da `event.target[targetAttr]`
      // al controllo e il `focusout` marca il touched.
      // NB: i componenti restano fuori da qui finché non emettono un @Event con
      // valore singolo: mds-input-otp (nessun evento), mds-input-date-range
      // (valore composito) e mds-input-upload (FileList) richiedono un CVA custom.
      valueAccessorConfigs: [
        // text: writeValue -> el.value ; legge event.target.value
        {
          elementSelectors: ['mds-input'],
          event: 'mdsInputChange',
          targetAttr: 'value',
          type: 'text',
        },
        {
          elementSelectors: ['mds-input-date'],
          event: 'mdsInputDateSelect',
          targetAttr: 'value',
          type: 'text',
        },
        // select: writeValue -> el.value
        {
          elementSelectors: ['mds-input-select'],
          event: 'mdsInputSelectChange',
          targetAttr: 'value',
          type: 'select',
        },
        // number: writeValue -> el.value, parsing numerico in registerOnChange
        {
          elementSelectors: ['mds-input-range'],
          event: 'mdsInputRangeChange',
          targetAttr: 'value',
          type: 'number',
        },
        // boolean: writeValue -> el.checked
        {
          elementSelectors: ['mds-input-switch'],
          event: 'mdsInputSwitchChange',
          targetAttr: 'checked',
          type: 'boolean',
        },
      ],
    }),
    reactOutputTarget({
      // Relative path to where the React components will be generated
      outDir: './react/src/',
      customElementsDir: 'dist/components',
      // Un modulo ES per wrapper (react/src/<tag>.ts) invece di un unico
      // components.ts con tutti e 114: il barrel resta ma diventa di sole
      // ri-esportazioni, così i bundler scartano i componenti non importati.
      esModules: true,
      // SSR: oltre ai wrapper client (invariati) genera un <tag>.server.ts
      // per componente che sul server usa renderToString dal modulo hydrate
      // (declarative shadow DOM nell'HTML iniziale, CLS ~0) e sul client
      // delega al wrapper di clientModule. Richiede l'output target
      // dist-hydrate-script esplicito e l'export "./hydrate" nel package.json.
      hydrateModule: '@maggioli-design-system/magma/hydrate',
      clientModule: '@maggioli-design-system/magma-react',
      serializeShadowRoot: 'declarative-shadow-dom',
    }),
    {
      type: 'dist-custom-elements',
      // `default` non ri-esporta nulla da dist/components/index.js: il barrel
      // esiste ma espone solo setAssetPath & co. Con `single-export-module`
      // ri-esporta ogni componente e il suo defineCustomElement<Pascal>,
      // rendendo `@maggioli-design-system/magma/components` l'entry
      // tree-shakeable dei web-component (le classi sono annotate @__PURE__).
      customElementsExportBehavior: 'single-export-module',
      // Non c'è globalScript configurato: senza questo flag il barrel
      // conterrebbe comunque una chiamata `globalScripts()` a livello di
      // modulo, cioè un side effect che i bundler devono tenere.
      includeGlobalScripts: false,
      // Con il runtime esterno (default true) i custom element importano lo
      // stock @stencil/core/internal/client, compilato con
      // hydrateClientSide:false e hydratedClass:true: il markup SSR
      // (declarative shadow DOM annotato s-id) non viene idratato ma
      // ri-renderizzato sopra, duplicando il contenuto, e il flag hydrated
      // diventa una classe invece dell'attributo configurato in hydratedFlag.
      // Bundlando il runtime, le build conditionals del progetto si applicano
      // (hydrateClientSide:true perché esiste dist-hydrate-script).
      externalRuntime: false,
    },
    {
      // Build hydrate per SSR (renderToString). Già prodotto implicitamente
      // da `--prerender`, ma reso esplicito perché reactOutputTarget lo
      // richiede quando hydrateModule è impostato (la sua validazione gira
      // prima che il target implicito venga aggiunto). Senza `dir` il default
      // sarebbe `hydrate/` alla radice del progetto, non `dist/hydrate`.
      type: 'dist-hydrate-script',
      dir: 'dist/hydrate',
    },
    {
      type: 'docs-readme',
      footer:
        'Built with love @ [Gruppo Maggioli](https://www.maggioli.com) from [R&D Department](https://www.maggioli.com/it-it/chi-siamo/ricerca-sviluppo)',
    },
    {
      type: 'docs-json',
      file: 'dist/documentation.json',
    },
    {
      type: 'www',
      baseUrl: 'http://localhost:6006/',
      serviceWorker: null,
    },
    {
      type: 'stats',
      file: './dist/stats.json',
    },
  ],
  plugins: [
    tokenFallbackPlugin({
      injectTokenFallbacks: true,
      injectSemanticFallbacks: true,
      injectComponentDefaults: true,
      warnOnMissing: false,
      failOnMissing: false,
    }),
    alias({
      entries: [
        { find: /^@common\/(.*)$/, replacement: path.resolve('.', './src/common/$1') },
        { find: /^@component\/(.*)$/, replacement: path.resolve('.', './src/components/$1') },
        { find: /^@dictionary\/(.*)$/, replacement: path.resolve('.', './src/dictionary/$1') },
        { find: /^@event\/(.*)$/, replacement: path.resolve('.', './src/event-detail/$1') },
        { find: /^@fixture\/(.*)$/, replacement: path.resolve('.', './src/fixtures/$1') },
        { find: /^@meta\/(.*)$/, replacement: path.resolve('.', './src/meta/$1') },
        {
          find: /^@icon\/([a-zA-Z-/]+)\.svg$/,
          replacement: path.resolve('.', './assets/svg/$1.svg'),
        },
        { find: /^@tailwind\/(.*)$/, replacement: path.resolve('.', './src/tailwind/$1') },
        { find: /^@test\/(.+)$/, replacement: path.resolve('.', './src/test/$1') },
        { find: /^@type\/(.+)$/, replacement: path.resolve('.', './src/type/$1') },
      ],
    }),
    tailwind({
      ...opts,
      minify: true, // with minify false ' will be replaced with %27 and broke style
      stripComments: true,
    }),
    // tailwindHMR({ ...opts }), // hot module reload for watch but not generate docs
    inlineSvg(),
  ],
  testing: {
    /**
     * Gitlab CI doesn't allow sandbox, therefor this parameters must be passed to your Headless Chrome
     * before it can run your tests
     */
    browserArgs: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    coveragePathIgnorePatterns: [
      '<rootDir>/.build/',
      '<rootDir>/template/',
      '<rootDir>/node_modules/',
    ],
    // moduleNameMapper: tsconfigPathsJest(tsconfig),
    moduleNameMapper: {
      '@common/(.*)': '<rootDir>src/common/$1',
      '@dictionary/(.*)': '<rootDir>src/dictionary/$1',
      '@event/(.*)': '<rootDir>src/event-detail/$1',
      '@fixture/(.*)': '<rootDir>src/fixtures/$1',
      '@meta/(.*)': '<rootDir>src/meta/$1',
      '@icon/(.*)': '<rootDir>assets/svg/$1',
      '@placeholder': 'https://via.placeholder.com',
      '@tailwind/(.*)': '<rootDir>src/tailwind/$1',
      '@test/(.*)': '<rootDir>src/test/$1',
      '@type/(.*)': '<rootDir>src/type/$1',
    },
    modulePathIgnorePatterns: [
      '<rootDir>/.build/',
      '<rootDir>/template/',
      '<rootDir>/node_modules/',
      '<rootDir>/angular/',
      '<rootDir>/react/',
    ],
    testPathIgnorePatterns: [
      '<rootDir>/.cache',
      '<rootDir>/template/',
      '<rootDir>/node_modules/',
      '<rootDir>/.vscode',
      '/.stencil',
      '/dist',
      '/www',
      '/scripts',
      // TEMPORARY (#662): files already running on @stencil/vitest
      ...MIGRATED_TESTS,
    ],
    transform: {
      '^.+\\.svg$': 'jest-transformer-svg',
      '^.+\\.(ts|tsx|js|jsx|css)$': '@stencil/core/testing/jest-preprocessor',
    },
    transformIgnorePatterns: ['<rootDir>/.build/', '<rootDir>/template/'],
    watchPathIgnorePatterns: ['"^.+\\.d\\.ts$" '],
  },
};
