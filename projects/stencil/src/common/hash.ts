/**
 * FNV-1a hash (32 bits) of a string, as eight lowercase hex digits: a small, synchronous and
 * environment-free way to turn a free text into a short, stable identifier, such as a storage
 * key. Not a cryptographic digest: nothing keyed on it is a security measure.
 *
 * The UTF-16 code units feed the hash, so the standard FNV-1a vectors hold for ASCII text.
 */
export const fnv1a = (text: string): string => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
};
