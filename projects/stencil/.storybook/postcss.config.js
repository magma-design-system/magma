import postcssImport from 'postcss-import';
import iconsauce from 'postcss-iconsauce';
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    postcssImport(),
    iconsauce('./.storybook/iconsauce.config.mjs'),
    tailwindcss(),
    autoprefixer({
      flexbox: 'no-2009',
    }),
  ],
};
