export const loadingDictionary = [
  'eager',
  'lazy',
] as const

export type LoadingType = (typeof loadingDictionary)[number]
