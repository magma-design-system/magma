export type NotificationItemPreviewType =
  | 'avatar'
  | 'image'

export type NotificationItemDateFormatType =
  | 'timeago'
  | string

export type RelativeTimeType = {
  future: string
  past: string
  s: string
  m: string
  mm: string
  h: string
  hh: string
  d: string
  dd: string
  M: string
  MM: string
  y: string
  yy: string
}
