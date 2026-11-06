import {
  ThemeBrandVariantType,
  themeStatusVariantDictionary,
  themeBrandVariantDictionary,
  themeLuminanceVariantDictionary,
  ThemeStatusVariantType,
  ThemeLuminanceVariantType,
} from './variant';

export const buttonTypeDictionary = ['button', 'submit', 'reset'] as const;
export type ButtonType = (typeof buttonTypeDictionary)[number] | 'a';

export const buttonTargetDictionary = ['blank', 'self'] as const;
export type ButtonTargetType = (typeof buttonTargetDictionary)[number];

export const buttonSizeDictionary = ['sm', 'md', 'lg', 'xl'] as const;
export type ButtonSizeType = (typeof buttonSizeDictionary)[number];

export const tabSizeDictionary = ['sm', 'md'] as const;
export type TabSizeType = (typeof tabSizeDictionary)[number];

// `true` (the attribute alone) is 'page', the view the button leads to; 'section' is a view
// inside it (#1264): `currentOf()` in @common/aria reads them
export const buttonCurrentDictionary = ['page', 'section'] as const;
export type ButtonCurrentType = boolean | (typeof buttonCurrentDictionary)[number];

export const buttonIconPositionDictionary = ['left', 'right'] as const;
export type ButtonIconPositionType = (typeof buttonIconPositionDictionary)[number];

export const buttonToneMinimalVariantDictionary = ['strong', 'weak'] as const;

export const buttonToneVariantDictionary = [
  ...buttonToneMinimalVariantDictionary,
  'outline',
  'text',
] as const;

export const buttonToneFullVariantDictionary = [
  ...buttonToneMinimalVariantDictionary,
  'outline',
  'text',
  'box',
] as const;

export type ButtonVariantType =
  'apple' | 'google' | ThemeLuminanceVariantType | ThemeBrandVariantType | ThemeStatusVariantType;

export type ButtonDropdownVariantType =
  ThemeLuminanceVariantType | ThemeBrandVariantType | ThemeStatusVariantType;

export const buttonDropdownVariantDictionary: ButtonDropdownVariantType[] = [
  ...themeLuminanceVariantDictionary,
  ...themeBrandVariantDictionary,
  ...themeStatusVariantDictionary,
];

export const buttonVariantDictionary: ButtonVariantType[] = [
  ...buttonDropdownVariantDictionary,
  'apple',
  'google',
];
