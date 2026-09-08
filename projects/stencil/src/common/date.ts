import { ISO8601Date } from '@type/date';

// ISO 8601 date regex allowing optional components (month, day, time)
const ISO8601RegexString =
  '^\\d{4}(-\\d{2})?(-\\d{2})?(T\\d{2}(:\\d{2})?(:\\d{2})?(\\.\\d{3})?)?([+-]\\d{2}:\\d{2}|Z)?$';

const isISO8601Date = (dateString: string): boolean => {
  const ISO8601Regex = new RegExp(ISO8601RegexString);
  return ISO8601Regex.test(dateString);
};

/**
 * Normalizes a date string to ISO 8601: a string already in ISO 8601 is returned as it is, any
 * other parsable date is converted, and `null` is returned when the string is not a date at all.
 */
const sanitizeISO8601Date = (dateString: string): ISO8601Date | null => {
  if (isISO8601Date(dateString)) {
    return dateString as ISO8601Date;
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString() as ISO8601Date;
};

export { sanitizeISO8601Date, isISO8601Date };
