/**
 * Deep merge of two objects. Mutates and returns `target`; pass a clone if
 * the target must stay pristine. Arrays are replaced, not merged.
 *
 * Lives in its own module (instead of utils.mts) so that browser consumers
 * of the color generator do not drag in the Node-only Style Dictionary
 * export helpers.
 */
export function deepMerge (target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const isObject = (obj: unknown): obj is Record<string, unknown> => obj !== null && typeof obj === 'object' && !Array.isArray(obj)

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          target[key] = {}
        }
        deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>)
      } else {
        target[key] = source[key]
      }
    }
  }

  return target
}
