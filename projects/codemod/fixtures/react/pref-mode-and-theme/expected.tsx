import {
  MdsPref,
  MdsPrefMode,
  MdsPrefTheme,
  MdsPrefThemeItem as ThemeItem,
} from '@maggioli-design-system/magma-react';

export const Prefs = () => (
  <MdsPref>
    <MdsPrefMode mode="dark" />
    <MdsPrefTheme name="business">
      <ThemeItem name="business" scheme="light" />
    </MdsPrefTheme>
  </MdsPref>
);
