export type LanguageType =
  | 'auto'
  | `${Lowercase<string>}${Lowercase<string>}`
  | `${Lowercase<string>}${Lowercase<string>}${Lowercase<string>}`
