export type LanguageType =
  | `${Lowercase<string>}${Lowercase<string>}`
  | `${Lowercase<string>}${Lowercase<string>}${Lowercase<string>}`

export type PrefLanguageType =
  | 'auto'
  | `${Lowercase<string>}${Lowercase<string>}`
  | `${Lowercase<string>}${Lowercase<string>}${Lowercase<string>}`
