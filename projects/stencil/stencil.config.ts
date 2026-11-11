import alias from '@rollup/plugin-alias';
// import autoprefixer from 'autoprefixer'
import path from 'path';
import { Config } from '@stencil/core';
import { inlineSvg } from 'stencil-inline-svg';
import tailwind, { PluginConfigurationOptions } from './scripts/tailwind-plugin/src';
import { reactOutputTarget } from '@stencil/react-output-target';
import { angularOutputTarget } from '@stencil/angular-output-target';
import tokenFallbackPlugin from './scripts/postcss-token-fallbacks';
import autoprefixPlugin from './scripts/postcss-autoprefix';

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
  // The lazy loader injects `<tags>{visibility:hidden}[hydrated]{visibility:<hydratedValue>}` in
  // an unlayered sheet, which beats every rule in a cascade layer. The default `inherit` so beat
  // the page's `@layer utilities` too: `invisible` never hid a hydrated host (#1229).
  // `revert-layer` keeps the hiding before hydration as strong as before (still unlayered), and
  // once the flag is set it hands visibility back to the layers, the host's own :host rules
  // included; with none, the host inherits, as `inherit` did. It ships with cascade layers, which
  // every browser of .browserslistrc has, and hydrated.css already relies on it.
  hydratedFlag: {
    selector: 'attribute',
    hydratedValue: 'revert-layer',
  },
  taskQueue: 'async',
  transformAliasedImportPaths: true,
  srcDir,
  // tsconfig dedicato che esclude le *.stories.tsx dal program TypeScript:
  // le storie restano nel tsconfig.json principale (editor, ESLint, paths di
  // Storybook) ma non vengono più compilate né copiate in dist/collection.
  tsconfig: 'tsconfig.stencil.json',
  sourceMap: false,
  // Stencil's pass prefixes for iOS 9 and IE 11: autoprefixPlugin prefixes for the browsers of
  // .browserslistrc instead
  autoprefixCss: false,
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
      directivesProxyFile: '../stencil-angular/magma-angular/src/stencil-generated/components.ts',
      directivesArrayFile: '../stencil-angular/magma-angular/src/stencil-generated/index.ts',
      // A ControlValueAccessor per form component, so [formControl], formControlName and
      // [(ngModel)] bind it: writeValue sets `targetAttr` on the element, `event` reports
      // `event.target[targetAttr]` to the control, focusout marks it touched and
      // setDisabledState sets the `disabled` prop, which the component reads with
      // formDisabledCallback in isDisabled(), as a disabled fieldset. One accessor class per
      // `type`: the configs of a type share its selectors and its events. The accessor of each
      // component follows the type of its value prop and the JSDoc of its change event, never
      // its name (tests: magma-angular/src/lib/value-accessors.spec.ts; guide:
      // docs/agents/angular.md, "Forms").
      // Left out, as they hold no single value a control can write and read back:
      // - mds-input-date-range: `startDate` and `endDate`, and `mdsInputDateRangeValueChange`
      //   carries both; the range writes them into its two slotted mds-input-date fields, which
      //   each take their own control;
      // - mds-input-upload: `mdsInputUploadChange` carries a FileList, which no prop takes back
      //   (Angular has no accessor for a native file input either);
      // - mds-input-otp: `value` has no change event of its own;
      // - mds-calendar: its `startDate` and `endDate` are readonly, the component never writes
      //   them, and the selection travels only in the detail of `mdsCalendarChange`;
      // - mds-input-date-range-preselection: `selected` marks a preset of its range, not a value.
      // The radio of mds-input-switch has a hand-written accessor
      // (magma-angular/src/lib/radio-value-accessor.ts): the `radio` type writes the control value
      // into `value`, which a group cannot hold.
      valueAccessorConfigs: [
        // `value: string` for every `type`, `number` included ("Specifies the value of the input
        // element"); mdsInputChange "Emits ... when the value of the input element changes"
        {
          elementSelectors: ['mds-input'],
          event: 'mdsInputChange',
          targetAttr: 'value',
          type: 'text',
        },
        // `value: string`, an ISO date (YYYY-MM-DD); mdsInputDateSelect "Emitted when the selected
        // date value changes"
        {
          elementSelectors: ['mds-input-date'],
          event: 'mdsInputDateSelect',
          targetAttr: 'value',
          type: 'text',
        },
        // `value?: string | number | null`; mdsInputSelectChange: "`value` is the first selected
        // option, `values` every selected one". A value selects its option alone, `multiple` too
        // (applySelection), so a multiple select reports its first option only
        {
          elementSelectors: ['mds-input-select'],
          event: 'mdsInputSelectChange',
          targetAttr: 'value',
          type: 'select',
        },
        // `value: number`; mdsInputRangeChange is an EventEmitter<number>
        {
          elementSelectors: ['mds-input-range'],
          event: 'mdsInputRangeChange',
          targetAttr: 'value',
          type: 'number',
        },
        // `checked?: boolean` for type switch and checkbox; mdsInputSwitchChange "Emits when the
        // value changes". A radio takes RadioValueAccessor instead, see above
        {
          elementSelectors: ['mds-input-switch:not([type=radio])'],
          event: 'mdsInputSwitchChange',
          targetAttr: 'checked',
          type: 'boolean',
        },
      ],
    }),
    reactOutputTarget({
      // Relative path to where the React components will be generated
      outDir: '../stencil-react/src/',
      customElementsDir: 'dist/components',
      // Un modulo ES per wrapper (projects/stencil-react/src/<tag>.ts) invece di un unico
      // components.ts con tutti e 115: il barrel resta ma diventa di sole
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
      injectGlobalFallbacks: true,
      injectComponentDefaults: true,
      warnOnMissing: false,
      // Every public token has a source the injector reads, so a bare
      // `var(--magma-*)` it cannot resolve is a typo or a missing token.
      failOnMissing: true,
      checkPrefixes: ['magma-'],
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
    // after Tailwind, which writes the declarations to prefix
    autoprefixPlugin(),
    // tailwindHMR({ ...opts }), // hot module reload for watch but not generate docs
    inlineSvg(),
  ],
};
