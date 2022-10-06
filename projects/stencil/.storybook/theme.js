import { create } from '@storybook/theming'
import brandImage from './magma-logo.svg'
export default create({
  base: 'light',
  colorPrimary: '#00379e',
  colorSecondary: '#00379e',
  fontBase: 'Roboto, Karla, system, "Open Sans", sans-serif',
  fontCode: 'monospace',
  brandTitle: 'Magma Design System',
  brandUrl: 'https://magma.maggiolicloud.it',
  brandImage,
})
