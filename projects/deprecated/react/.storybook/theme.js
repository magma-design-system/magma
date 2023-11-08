import { create } from '@storybook/theming'
import brandImage from '@maggioli-design-system/identity/dist/gruppo-maggioli/logo-gruppo-maggioli.svg'
export default create({

  base: 'light',
  colorPrimary: '#00379e',
  colorSecondary: '#00379e',

  // UI
  appBg: '#efefef',
  appContentBg: '#fff',
  appBorderColor: 'transparent',
  appBorderRadius: 5,

  // Typography
  fontBase: 'Roboto, Karla, system, "Open Sans", sans-serif',
  fontCode: 'monospace',

  // Text colors
  textColor: '#333',
  textInverseColor: '#aaa',

  // Toolbar default and active colors
  barTextColor: '#efefef',
  barSelectedColor: '#fff',
  barBg: '#c8c8c8',

  // Form colors
  inputBg: '#fff',
  inputBorder: '#ddd',
  inputTextColor: '#ddd',
  inputBorderRadius: 0,

  brandTitle: 'Maggiolino',
  brandUrl: 'https://www.maggioli.it',
  brandImage,
})
