/* eslint-disable @typescript-eslint/no-require-imports */
module.exports = {
  content: [
    './src/**/*.{js,json,ts,tsx}',
    require.resolve('@maggioli-design-system/svg-icons/dist/iconsauce.json'),
  ],
  plugin: [
    require('@iconsauce/material-icons'),
    require('@iconsauce/mdi-svg'),
    require('@iconsauce/mgg-icons'),
  ],
};
