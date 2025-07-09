import { create } from 'storybook/theming'
import brandImage from './magma-logo.svg'
export default create({
  appBorderRadius: 6,
  base: 'light',
  brandImage,
  brandTitle: 'Magma Design System',
  brandUrl: 'https://magma.maggiolicloud.it',
  colorSecondary: '#0A50D4',
  fontBase: 'Roboto, Karla, system, "Open Sans", sans-serif',
  fontCode: 'monospace',
})
