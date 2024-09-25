type ISO8601DateFormat<K, T> = K & { __isISO8601DateFormat: T };

// ISO 8601 date regex allowing optional components (month, day, time)
const ISO8601RegexString = '^\\d{4}(-\\d{2})?(-\\d{2})?(T\\d{2}(:\\d{2})?(:\\d{2})?(\\.\\d{3})?)?([+-]\\d{2}:\\d{2}|Z)?$'

// Defines a branded type for the date ISO 8601 string
type ISO8601Date = ISO8601DateFormat<string, 'ISO8601Date'>


const sanitizeISO8601Date = (dateString: string): ISO8601Date => {
  const ISO8601Regex = new RegExp(ISO8601RegexString)
  if (ISO8601Regex.test(dateString)) {
    return dateString as ISO8601Date
  }
  return new Date().toISOString() as ISO8601Date
}

const isISO8601Date = (dateString: string): boolean => {
  const ISO8601Regex = new RegExp(ISO8601RegexString)
  return ISO8601Regex.test(dateString)
}

// const validDate: ISO8601Date = sanitizeISO8601Date('2024-09-24T15:30:00Z')

export {
  ISO8601Date,
  sanitizeISO8601Date,
  isISO8601Date,
}
