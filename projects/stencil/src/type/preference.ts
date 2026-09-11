export const UIPreferenceTypeDictionary = [
  'animation',
  'consumption',
  'contrast',
  'corner-shape',
  'language',
  'theme-mode',
  'theme-variant',
] as const;
export type UIPreferenceType = (typeof UIPreferenceTypeDictionary)[number];

export const preferenceThemeSchemeType = ['light', 'dark', 'all'] as const;
export type PreferenceThemeSchemeType = (typeof preferenceThemeSchemeType)[number];

export const preferenceThemeModeType = ['light', 'dark', 'system'] as const;
export type PreferenceThemeModeType = (typeof preferenceThemeModeType)[number];

export const preferenceThemeTransitionType = ['none', 'flash', 'smooth'] as const;
export type PreferenceThemeTransitionType = (typeof preferenceThemeTransitionType)[number];

export const consumptionModeType = ['high', 'medium', 'low'] as const;
export type ConsumptionModeType = (typeof consumptionModeType)[number];

export const preferenceCornerShapeType = [
  'bevel',
  'notch',
  'round',
  'scoop',
  'square',
  'squircle',
] as const;
export type PreferenceCornerShapeType = (typeof preferenceCornerShapeType)[number];

/**
 * What a user can pick for the corner axis: a shape, or `default`.
 *
 * `default` is not a shape, it is the ABSENCE of a deviation - whatever the
 * stylesheet currently ships. It exists so choosing the shape that happens to be
 * today's default removes the attribute instead of freezing that default into
 * the consumer's markup, which would keep a later change of default from
 * reaching anybody who never chose.
 */
export const preferenceCornerShapeChoiceType = [...preferenceCornerShapeType, 'default'] as const;
export type PreferenceCornerShapeChoiceType = (typeof preferenceCornerShapeChoiceType)[number];
