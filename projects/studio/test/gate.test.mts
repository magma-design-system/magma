import { expect, test } from 'vitest'

import initialConfig from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs'
import { gateVerdict } from '../src/gate.js'

// The badge of the Colors menu says what `nx run design-tokens:contrast` says of the same
// configuration: the gate passes on the configuration Magma builds with.

const config = () => JSON.parse(JSON.stringify(initialConfig)) as MagmaConfig

test('the configuration Magma builds with passes the gate', () => {
  expect(gateVerdict(config()).state).toBe('pass')
})

test('text targets under their floors fail the gate', () => {
  const low = config()
  low.theme!.text = { default: 20, muted: 15, subtle: 10, disabled: 5 }
  const verdict = gateVerdict(low)
  expect(verdict.state).toBe('fail')
  expect(verdict.state === 'fail' && verdict.violations).toBeGreaterThan(0)
})
