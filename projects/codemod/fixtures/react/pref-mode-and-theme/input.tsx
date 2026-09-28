import {
  MdsPref,
  MdsPrefTheme,
  MdsPrefThemeVariant,
  MdsPrefThemeVariantItem as ThemeItem,
} from '@maggioli-design-system/magma-react';

export const Prefs = () => (
  <MdsPref>
    <MdsPrefTheme mode="dark" />
    <MdsPrefThemeVariant name="business">
      <ThemeItem name="business" scheme="light" />
    </MdsPrefThemeVariant>
  </MdsPref>
);
