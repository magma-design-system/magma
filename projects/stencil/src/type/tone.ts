export const toneMinimalVariantDictionary = ['strong', 'weak'] as const;
export type ToneMinimalVariantType = (typeof toneMinimalVariantDictionary)[number];

export const toneMinimalBoxVariantDictionary = ['strong', 'weak', 'box'] as const;
export type ToneMinimalBoxVariantType = (typeof toneMinimalBoxVariantDictionary)[number];

export const toneSmartVariantDictionary = [...toneMinimalVariantDictionary, 'outline'] as const;
export type ToneSmartVariantType = (typeof toneSmartVariantDictionary)[number];

export const toneSimpleVariantDictionary = [...toneMinimalVariantDictionary, 'text'] as const;
export type ToneSimpleVariantType = (typeof toneSimpleVariantDictionary)[number];

export const toneVariantDictionary = ['outline', 'strong', 'text', 'weak'] as const;
export type ToneVariantType = (typeof toneVariantDictionary)[number];

export const toneBoxVariantDictionary = ['outline', 'strong', 'text', 'box', 'weak'] as const;
export type ToneBoxVariantType = (typeof toneBoxVariantDictionary)[number];
