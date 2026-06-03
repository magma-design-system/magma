export const typographyDictionary = [
  'action',
  'caption',
  'snippet',
  'detail',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hack',
  'label',
  'option',
  'paragraph',
  'tip',
] as const;
export type TypographyType = (typeof typographyDictionary)[number];

export const typographyVariationsDictionary = ['title', 'info', 'read', 'code'] as const;
export type TypographyVariants = (typeof typographyVariationsDictionary)[number];

export const typographyReadingVariationsDictionary = ['info', 'read'] as const;
export type TypographyReadingVariants = (typeof typographyReadingVariationsDictionary)[number];

export const typographyMonoDictionary = ['snippet', 'hack'] as const;
export type TypographyMonoType = (typeof typographyMonoDictionary)[number];

export const typographyTitleDictionary = ['action', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
export type TypographyTitleType = (typeof typographyTitleDictionary)[number];

export const typographyInfoDictionary = [
  'caption',
  'detail',
  'label',
  'option',
  'paragraph',
  'tip',
] as const;
export type TypographyInfoType = (typeof typographyInfoDictionary)[number];

export const typographyReadDictionary = ['caption', 'detail', 'paragraph'] as const;
export type TypographyReadType = (typeof typographyReadDictionary)[number];

export const typographySmallerDictionary = ['option', 'tip'] as const;
export type TypographySmallerType = (typeof typographySmallerDictionary)[number];

export const typographyLabelDictionary = ['option', 'label'] as const;
export type TypographyLabelType = (typeof typographyLabelDictionary)[number];

export const typographyTooltipDictionary = ['caption', 'detail', 'tip'] as const;
export type TypographyTooltipType = (typeof typographyTooltipDictionary)[number];

export const typographyInputDictionary = ['snippet', 'detail'] as const;
export type TypographyInputType = (typeof typographyInputDictionary)[number];

export const typographyTechnicalDictionary = ['option', 'label'] as const;
export type TypographyTechnicalType = (typeof typographyTechnicalDictionary)[number];
