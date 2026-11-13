export type CrossoriginType = 'anonymous' | 'use-credentials';

// the values of the decoding attribute of <img> (HTML, "Decoding images")
export const decodingDictionary = ['async', 'auto', 'sync'] as const;

export type DecodingType = (typeof decodingDictionary)[number];

export type ReferrerpolicyType =
  | 'no-referrer'
  | 'no-referrer-when-downgrade'
  | 'origin'
  | 'origin-when-cross-origin'
  | 'unsafe-url';

export type ImageConsumptionType = {
  low?: string;
  medium?: string;
  high?: string;
};
