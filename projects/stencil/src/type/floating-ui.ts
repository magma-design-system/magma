export const floatingUIPlacementDictionary = [
  'bottom',
  'bottom-end',
  'bottom-start',
  'left',
  'left-end',
  'left-start',
  'right',
  'right-end',
  'right-start',
  'top',
  'top-end',
  'top-start',
] as const
export type FloatingUIPlacement = (typeof floatingUIPlacementDictionary)[number]

export const floatingUIStrategyDictionary = [
  'absolute',
  'fixed',
] as const
export type FloatingUIStrategy = (typeof floatingUIStrategyDictionary)[number]
