const {
  mergeConfig
} = require('vite');
module.exports = {
  "stories": ["../../components/mds-*/src/**/*.stories.@(js|jsx|ts|tsx)"],
  "addons": ["@storybook/addon-links", "@storybook/addon-essentials"],
  "framework": {
    name: "@storybook/web-components-vite",
    options: {}
  },
  "features": {
    "storyStoreV7": true
  },
  async viteFinal(config, {
    configType
  }) {
    return mergeConfig(config, {});
  },
  docs: {
    autodocs: true
  }
};