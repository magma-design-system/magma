export type NotificationPreviewType =
  | 'avatar'
  | 'image'

export type NotificationDateFormatType =
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
