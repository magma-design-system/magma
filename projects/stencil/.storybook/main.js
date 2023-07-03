// https://www.mokkapps.de/blog/run-build-and-deploy-stencil-and-storybook-from-one-repository
const path = require('path');
const alias = {
  '@component-dist': path.resolve(__dirname, '../dist/collection/components'),
  '@dictionary': path.resolve(__dirname, '../src/dictionary/'),
  '@fixture': path.resolve(__dirname, '../src/fixtures/'),
  '@icon': path.resolve(__dirname, '../assets/svg/'),
  '@placeholder': 'https://via.placeholder.com',
  '@test': path.resolve(__dirname, '../src/test/'),
  '@type': path.resolve(__dirname, '../src/types/')
};
const TsConfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const stories = ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)']
const staticDirs = ['../assets', '../dist']
const addons = ['@storybook/addon-essentials', {
    name: '@storybook/addon-styling',
    options: {
      postCss: {
        implementation: require('postcss')
      }
    },
  },
]
const  webpackFinal = async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    config.resolve.alias = {
      ...config.resolve.alias,
      ...alias
    };
    config.module.rules.push(
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
      test: /\.stories.tsx$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            sourceType: 'unambiguous',
            babelrc: false,
            presets: [['@babel/preset-react',{"runtime": "automatic"}], '@babel/preset-typescript']
          }
        }
      ]
    }, {
      test: /\.css$/,
      use: [{
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            plugins: [require('postcss-iconsauce')('./.storybook/iconsauce.config.js'), require('tailwindcss')('./.storybook/tailwind.config.js'), require('autoprefixer')]
          }
        }
      }],
      include: path.resolve(__dirname, '../')
    });
    config.resolve.fallback = {
      path: false
    };
    config.resolve.plugins = config.resolve.plugins || [];
    config.resolve.plugins.push(new TsConfigPathsPlugin({
      configFile: path.resolve(__dirname, "../tsconfig.json")
    }));
    return config;
  }
const framework = { name: '@storybook/react-webpack5', options: {} }
const docs = { autodocs: true }

const config = {
  stories,
  staticDirs,
  addons,
  webpackFinal,
  framework,
  docs
}

export default config;
