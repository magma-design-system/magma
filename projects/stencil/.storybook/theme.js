import { create } from '@storybook/theming'
import brandImage from '@maggioli-design-system/identity/dist/gruppo-maggioli/logo-gruppo-maggioli.svg'
export default create({
  base: 'light',
  colorPrimary: '#00379e',
  colorSecondary: '#00379e',
  fontBase: 'Roboto, Karla, system, "Open Sans", sans-serif',
  fontCode: 'monospace',
  brandTitle: 'Maggioli Design System',
  brandUrl: 'https://www.maggioli.com',
  brandImage,
})
