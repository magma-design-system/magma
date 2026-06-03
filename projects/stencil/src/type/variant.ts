export const themeStatusVariantDictionary = ['error', 'info', 'success', 'warning'] as const;
export type ThemeStatusVariantType = (typeof themeStatusVariantDictionary)[number];

export const themeLabelVariantDictionary = [
  'amaranth',
  'red',
  'aqua',
  'blue',
  'green',
  'lime',
  'orange',
  'orchid',
  'purple',
  'sky',
  'violet',
  'yellow',
] as const;
export type ThemeLabelVariantType = (typeof themeLabelVariantDictionary)[number];

export const themeLuminanceVariantDictionary = ['dark', 'light'] as const;
export type ThemeLuminanceVariantType = (typeof themeLuminanceVariantDictionary)[number];

export const themeBrandVariantDictionary = ['ai', 'primary', 'secondary'] as const;
export type ThemeBrandVariantType = (typeof themeBrandVariantDictionary)[number];

export const themeInputVariantDictionary = [
  'ai',
  'primary',
  ...themeStatusVariantDictionary,
] as const;
export type ThemeInputVariantType = (typeof themeInputVariantDictionary)[number];

export const themeVariantDictionary = [
  ...themeInputVariantDictionary,
  ...themeLuminanceVariantDictionary,
] as const;
export type ThemeVariantType = (typeof themeVariantDictionary)[number];

export const themeFullVariantDictionary = [
  ...themeLabelVariantDictionary,
  ...themeLuminanceVariantDictionary,
  ...themeStatusVariantDictionary,
] as const;
export type ThemeFullVariantType = (typeof themeFullVariantDictionary)[number];

export const themeFullVariantAvatarDictionary = [
  ...themeLabelVariantDictionary,
  ...themeStatusVariantDictionary,
  'primary',
] as const;
export type ThemeFullVariantAvatarType = (typeof themeFullVariantAvatarDictionary)[number];

export const actionVariantDictionary = ['primary', ...themeLuminanceVariantDictionary] as const;
export type ActionVariantType = (typeof actionVariantDictionary)[number];

export const themeVariantChipDictionary = [
  'dark',
  ...themeLabelVariantDictionary,
  ...themeBrandVariantDictionary,
  ...themeStatusVariantDictionary,
] as const;
export type ChipVariantType = (typeof themeVariantChipDictionary)[number];
