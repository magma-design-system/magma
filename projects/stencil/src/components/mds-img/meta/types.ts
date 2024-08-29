export type CrossoriginType =
  | 'anonymous'
  | 'use-credentials'

export type ReferrerpolicyType =
  | 'no-referrer'
  | 'no-referrer-when-downgrade'
  | 'origin'
  | 'origin-when-cross-origin'
  | 'unsafe-url'

export type ImageConsumptionType =
  {
    low?: string,
    medium?: string,
    high?: string,
  }
