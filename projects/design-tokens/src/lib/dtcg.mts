// Maps the generated color token tree to the W3C Design Tokens Community
// Group (DTCG) format (`$type` / `$value` / `$description`). DTCG has no
// concept of modes, so light and dark are emitted as separate token files;
// in Figma each file is imported into a mode of the same variable collection.
// Kept pure (no fs) so the CLI build script and the browser playground share
// one mapping and produce identical output.

interface TokenValue {
  value: string,
}

type StepMap = Record<string, TokenValue>

interface ColorModes {
  light?: StepMap,
  dark?: StepMap,
}

/** color token tree: group -> name -> { light, dark } -> step -> { value } */
export type ColorTokenTree = Record<string, Record<string, ColorModes>>

export type ColorMode = 'light' | 'dark'

export interface DtcgColorToken {
  $type: 'color',
  $value: string,
  $description?: string,
}

/** DTCG group tree: group -> name -> step -> color token */
export type DtcgColorGroup = Record<string, Record<string, Record<string, DtcgColorToken>>>

// the `color` step holds the seed value; numeric steps keep their source key.
// Padding is deliberately avoided: a canonical integer key like "10" would be
// hoisted ahead of the string keys "1".."9" by the JS object key order, which
// breaks the file ordering and its clean diffs
function stepKey (step: string): string {
  return step === 'color' ? 'seed' : step
}

/**
 * Convert one theme mode of the color token tree into a DTCG group tree.
 * @param color the `color` sub-tree of the generated tokens (group -> name -> modes)
 * @param mode which theme mode to emit
 */
export function colorsToDtcg (color: ColorTokenTree, mode: ColorMode): DtcgColorGroup {
  const out: DtcgColorGroup = {}
  for (const [group, names] of Object.entries(color)) {
    const groupOut: Record<string, Record<string, DtcgColorToken>> = {}
    for (const [name, modes] of Object.entries(names)) {
      const steps = modes[mode]
      if (!steps) continue
      const tokenOut: Record<string, DtcgColorToken> = {}
      for (const [step, entry] of Object.entries(steps)) {
        const token: DtcgColorToken = { $type: 'color', $value: entry.value.toLowerCase() }
        if (step === 'color') token.$description = 'seed / base color'
        tokenOut[stepKey(step)] = token
      }
      groupOut[name] = tokenOut
    }
    out[group] = groupOut
  }
  return out
}
