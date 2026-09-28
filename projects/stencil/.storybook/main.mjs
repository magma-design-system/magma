// https://www.mokkapps.de/blog/run-build-and-deploy-stencil-and-storybook-from-one-repository
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import iconsauce from 'postcss-iconsauce';
import { mergeConfig } from 'vite';

const nodeRequire = createRequire(import.meta.url);
const configDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(configDir, '..');

// Vite does not read the tsconfig `paths`: mirror them (same list as vitest.config.mts)
const alias = {
  '@common': path.resolve(projectDir, 'src/common'),
  '@component': path.resolve(projectDir, 'src/components'),
  '@dictionary': path.resolve(projectDir, 'src/dictionary'),
  '@event': path.resolve(projectDir, 'src/event-detail'),
  '@fixture': path.resolve(projectDir, 'src/fixtures'),
  '@icon': path.resolve(projectDir, 'assets/svg'),
  '@meta': path.resolve(projectDir, 'src/meta'),
  '@placeholder': 'https://via.placeholder.com',
  '@tailwind': path.resolve(projectDir, 'src/tailwind'),
  '@test': path.resolve(projectDir, 'src/test'),
  '@type': path.resolve(projectDir, 'src/type'),
};
const stories = ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'];
const staticDirs = ['../assets', '../dist'];
const addons = [
  getAbsolutePath('@storybook/addon-a11y'),
  getAbsolutePath('@storybook/addon-docs'),
  getAbsolutePath('@storybook/addon-vitest'),
];

// Tailwind 4 rewrites the whole stylesheet in its `Once` hook, which runs before any `AtRule`
// visitor, and drops the unknown `@iconsauce` at-rule with it. Under webpack css-loader fed the
// imported iconsauce.css to PostCSS on its own, so Tailwind never saw the at-rule; Vite inlines
// the `@import`s first, so the icons have to be resolved in a `Once` that runs ahead of Tailwind.
const iconsauceBeforeTailwind = () => {
  const plugin = iconsauce(path.resolve(configDir, 'iconsauce.config.mjs'));
  return {
    postcssPlugin: 'iconsauce-before-tailwind',
    async Once(root, { result }) {
      await postcss([plugin]).process(root, { from: result.opts.from });
    },
  };
};

// Shared by `storybook dev|build` and by the `storybook` project of vitest.config.mts
const viteFinal = async (config) =>
  mergeConfig(config, {
    resolve: { alias },
    css: {
      // the same pipeline the webpack builder ran through postcss-loader
      postcss: { plugins: [iconsauceBeforeTailwind(), tailwindcss, autoprefixer] },
    },
    // the stories are React JSX (automatic runtime): tsconfig.json declares the Stencil `h`
    // factory for the components, and @storybook/react-vite ships no React plugin of its own
    oxc: { jsx: { runtime: 'automatic' } },
  });

const framework = {
  name: getAbsolutePath('@storybook/react-vite'),
  options: { legacyRootApi: true },
};
const docs = {};

const config = {
  stories,
  staticDirs,
  addons,
  viteFinal,
  framework,

  options: {
    storySort: (a, b) => {
      return a.title.localeCompare(b.title, 'it-IT', { numeric: true });
    },
  },

  docs,

  typescript: {
    // no React component to document: the props tables come from the stories' argTypes
    reactDocgen: false,
  },
};

export default config;

function getAbsolutePath(value) {
  return path.dirname(nodeRequire.resolve(path.join(value, 'package.json')));
}
