/* eslint-disable @typescript-eslint/no-require-imports */
module.exports = {
  content: [
    './src/components/**/*.{js,json,ts,tsx}',
    './src/type/**/*.ts',
    require.resolve('@maggioli-design-system/svg-icons/dist/iconsauce.json'),
  ],
  plugin: [
    require('@iconsauce/material-icons'),
    require('@iconsauce/mdi-svg'),
    require('@iconsauce/mgg-icons'),
  ],
};
