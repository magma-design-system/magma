import { create } from 'storybook/theming';
import brandImage from './magma-logo.svg';

const brand = {
  appBorderRadius: 6,
  brandImage,
  brandTitle: 'Magma Design System',
  brandUrl: 'https://magma.maggiolicloud.it',
  colorSecondary: '#0A50D4',
  fontBase: 'Roboto, Karla, system, "Open Sans", sans-serif',
  fontCode: 'monospace',
};

// One theme per scheme, so the chrome follows the mode the preview renders.
export const themes = {
  dark: create({ ...brand, base: 'dark' }),
  light: create({ ...brand, base: 'light' }),
};

export default themes.light;
