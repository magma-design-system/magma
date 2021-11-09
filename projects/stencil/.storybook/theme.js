import { create } from '@storybook/theming'
import brandImage from './magma-design-system.svg'
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
