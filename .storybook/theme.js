import { create } from '@storybook/theming';
import brandImage from '../src/assets/logo/gruppo-maggioli.svg';

export default create({

  base: 'light',
  colorPrimary: '#1b59a3',
  colorSecondary: '#888',

  // UI
  appBg: '#efefef',
  appContentBg: '#fff',
  appBorderColor: '#aaa',
  appBorderRadius: 0,

  // Typography
  fontBase: '"Open Sans", sans-serif',
  fontCode: 'monospace',

  // Text colors
  textColor: '#333',
  textInverseColor: '#ddd',

  // Toolbar default and active colors
  barTextColor: '#efefef',
  barSelectedColor: '#fff',
  barBg: '#888',

  // Form colors
  inputBg: '#fff',
  inputBorder: '#ddd',
  inputTextColor: '#ddd',
  inputBorderRadius: 0,

  brandTitle: 'Maggiolino',
  brandUrl: 'https://www.maggioli.it',
  brandImage,
})
