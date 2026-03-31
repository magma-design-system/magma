export const headerBarMenuDictionary = [
  'all',
  'desktop',
  'mobile',
  'none',
] as const
export type HeaderBarMenuType = (typeof headerBarMenuDictionary)[number]

export const headerBarNavDictionary = [
  'all',
  'desktop',
  'mobile',
  'none',
] as const
export type HeaderBarNavType = (typeof headerBarNavDictionary)[number]
