// https://www.mokkapps.de/blog/run-build-and-deploy-stencil-and-storybook-from-one-repository
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import iconsauce from 'postcss-iconsauce';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';

const nodeRequire = createRequire(import.meta.url);
const configDir = path.dirname(fileURLToPath(import.meta.url));

const alias = {
  '@dictionary': path.resolve(configDir, '../src/dictionary/'),
  '@fixture': path.resolve(configDir, '../src/fixtures/'),
  '@icon': path.resolve(configDir, '../assets/svg/'),
  '@placeholder': 'https://via.placeholder.com',
  '@test': path.resolve(configDir, '../src/test/'),
  '@type': path.resolve(configDir, '../src/types/'),
};
const stories = ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'];
const staticDirs = ['../assets', '../dist'];
const addons = [
  getAbsolutePath('@storybook/addon-a11y'),
  getAbsolutePath('@storybook/addon-styling-webpack'),
  getAbsolutePath('@storybook/addon-webpack5-compiler-babel'),
  getAbsolutePath('@storybook/addon-docs'),
];
const webpackFinal = async (config) => {
  // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
  // You can change the configuration based on that.
  // 'PRODUCTION' is used when building the static version of storybook.

  config.resolve.alias = {
    ...config.resolve.alias,
    ...alias,
  };
  config.module.rules.push(
    {
      test: /\.ts$/,
      use: 'ts-loader',
      exclude: /node_modules/,
    },
    {
      test: /(\.stories\.tsx|preview\.jsx)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            sourceType: 'unambiguous',
            babelrc: false,
            presets: [
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript',
            ],
          },
        },
      ],
    },
    {
      test: /\.css$/,
      use: [
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [
                iconsauce('./.storybook/iconsauce.config.mjs'),
                tailwindcss,
                autoprefixer,
              ],
            },
          },
        },
      ],
      include: path.resolve(configDir, '../'),
    },
  );
  config.resolve.fallback = {
    crypto: false,
    path: false,
  };
  config.resolve.plugins = config.resolve.plugins || [];
  config.resolve.plugins.push(
    new TsconfigPathsPlugin({
      configFile: path.resolve(configDir, '../tsconfig.json'),
    }),
  );
  return config;
};
const framework = {
  name: getAbsolutePath('@storybook/react-webpack5'),
  options: { legacyRootApi: true },
};
const docs = {};

const config = {
  stories,
  staticDirs,
  addons,
  webpackFinal,
  framework,

  options: {
    storySort: (a, b) => {
      return a.title.localeCompare(b.title, 'it-IT', { numeric: true });
    },
  },

  docs,

  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};

export default config;

function getAbsolutePath(value) {
  return path.dirname(nodeRequire.resolve(path.join(value, 'package.json')));
}
