export const horizontalActionsAnimationDictionary = [
  'fade',
  'slide',
] as const

export type HorizontalActionsAnimationType = (typeof horizontalActionsAnimationDictionary)[number]
