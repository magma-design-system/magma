import { expect, test } from 'vitest'

import { endsOf, moveEnd } from '../src/hue-ends.js'

// The link of the two ends of a hue shift: read back from the two values the configuration keeps,
// and applied when one end moves.

test('the link is read back from the two ends', () => {
  expect(endsOf(44, -44)).toBe('mirror')
  expect(endsOf(44, 44)).toBe('linked')
  expect(endsOf(-18, 10)).toBe('free')
  // no hue shift yet, or off: the default link
  expect(endsOf(0, 0)).toBe('mirror')
})

test('the end that moves takes the other with it, as the link says', () => {
  const ends = { dark: -18, light: 10 }
  expect(moveEnd('free', ends, 'dark', 30)).toEqual({ dark: 30, light: 10 })
  expect(moveEnd('mirror', ends, 'dark', 30)).toEqual({ dark: 30, light: -30 })
  expect(moveEnd('mirror', ends, 'light', 12)).toEqual({ dark: -12, light: 12 })
  expect(moveEnd('linked', ends, 'light', 12)).toEqual({ dark: 12, light: 12 })
  // a mirrored zero stays a plain zero in the configuration
  expect(Object.is(moveEnd('mirror', ends, 'dark', 0).light, 0)).toBe(true)
})
