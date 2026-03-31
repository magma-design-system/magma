export const UIPreferenceTypeDictionary = [
  'animation',
  'consumption',
  'contrast',
  'language',
  'theme-mode',
  'theme-variant',
] as const
export type UIPreferenceType = (typeof UIPreferenceTypeDictionary)[number]

export const preferenceThemeSchemeType = [
  'light',
  'dark',
  'all',
] as const
export type PreferenceThemeSchemeType = (typeof preferenceThemeSchemeType)[number]

export const preferenceThemeModeType = [
  'light',
  'dark',
  'system',
] as const
export type PreferenceThemeModeType = (typeof preferenceThemeModeType)[number]

export const preferenceThemeTransitionType = [
  'none',
  'flash',
  'smooth',
] as const
export type PreferenceThemeTransitionType = (typeof preferenceThemeTransitionType)[number]

export const consumptionModeType = [
  'high',
  'medium',
  'low',
] as const
export type ConsumptionModeType = (typeof consumptionModeType)[number]
