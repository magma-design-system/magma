export type InputControlsLayoutType =
  | 'horizontal'
  | 'vertical'

export type InputControlsIconType =
  | 'arrow'
  | 'arithmetic'

export type InputValueType =
  | null
  | number
  | string
  | undefined

export type InputTextType =
  | 'date'
  | 'email'
  | 'number'
  | 'password'
  | 'search'
  | 'tel'
  | 'text'
  | 'textarea'
  | 'time'
  | 'url'

export interface MdsInputEventDetail {
  value?: File | string | FormData | null
}
