type ISO8601DateFormat<K, T> = K & { __isISO8601DateFormat: T };

// Defines a branded type for the date ISO 8601 string
type ISO8601Date = ISO8601DateFormat<string, 'ISO8601Date'>

// const validDate: ISO8601Date = sanitizeISO8601Date('2024-09-24T15:30:00Z')

export {
  ISO8601Date,
}
