export const inputControlsLayoutDictionary = [
  'horizontal',
  'vertical',
] as const
export type InputControlsLayoutType = (typeof inputControlsLayoutDictionary)[number]

export const inputControlsIconDictionary = [
  'arrow',
  'arithmetic',
] as const
export type InputControlsIconType = (typeof inputControlsIconDictionary)[number]

export type InputValueType =
  | null
  | number
  | string
  | undefined

export const inputTextTypeDictionary = [
  'date',
  'email',
  'number',
  'password',
  'search',
  'tel',
  'text',
  'textarea',
  'time',
  'url',
] as const

export const inputFieldTypeDictionary = [
  ...inputTextTypeDictionary,
  'cc',
  'cf',
  'isbn',
  'piva',
] as const
export type InputTextType = (typeof inputFieldTypeDictionary)[number]

export interface MdsInputEventDetail {
  value?: File | string | FormData | null
}
