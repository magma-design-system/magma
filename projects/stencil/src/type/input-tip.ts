export const inputTipItemVariantDictionary = [
  'count-almost',
  'count-almost-full',
  'count-empty',
  'count-full',
  'count-incomplete',
  'disabled',
  'readonly',
  'required',
  'required-success',
  'text',
] as const
export type InputTipItemVariantType = (typeof inputTipItemVariantDictionary)[number]
