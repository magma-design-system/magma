import { expect, test } from 'vitest'
import bundledJson from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json'

import { changesOf, type Change, type PresetState } from './changes.js'
import { NO_THEME_CHOICES } from './theme-choices.js'

// The changes of the work (#1402): what differs between the preset at the last exit and the preset
// now, one line per value, each in the stage that changes it (object model, section 4, Change).

/** The configuration Magma builds with, its families and values open to the test. */
type Loose = { colors: Array<{ name: string; [key: string]: unknown }>; [key: string]: unknown }

const preset = (): { config: Loose; choices: PresetState['choices'] } => ({
  config: JSON.parse(JSON.stringify(bundledJson)) as Loose,
  choices: { names: {}, accents: {}, modes: {} },
})

/** A change in one line: its stage, what, which value, from and to. */
const line = ({ stage, subject, kind, field, before, after }: Change) =>
  [
    stage,
    subject.vars ? `${subject.text} ${JSON.stringify(subject.vars)}` : subject.text,
    kind,
    field?.text,
    before?.text,
    after?.text,
  ]
    .filter((part) => part !== undefined)
    .join(' | ')

test('the same preset has no change', () => {
  expect(changesOf(preset(), preset())).toEqual([])
})

test('a family added, removed, or with a value changed, in Colours', () => {
  const before = preset()
  const after = preset()
  // label.red writes its colour and its export, and inherits its colorspace
  const red = after.config.colors.find((one) => one.name === 'label.red')!
  const was = String(red.color)
  red.color = '#d32f2f'
  red.colorspace = 'OKLCH'
  after.config.colors.push({ name: 'brand.ocean', color: '#0055aa' })
  after.config.colors.splice(
    after.config.colors.findIndex((one) => one.name === 'tone.bisque'),
    1,
  )
  expect(changesOf(before, after).map(line)).toEqual([
    `colours | label.red | changed | Base colour | ${was} | #d32f2f`,
    // a value the family did not write has nothing before it
    'colours | label.red | changed | Colorspace | OKLCH',
    'colours | brand.ocean | added',
    'colours | tone.bisque | removed',
  ])
})

test('the scales, the groups and the settings of the preset change in Colours', () => {
  const before = preset()
  const after = preset()
  after.config.ratios = { wcag3: { brand: [10, 20, 30] } }
  ;(after.config.groups as Record<string, Record<string, unknown>>).status.surface = false
  after.config.smooth = true
  expect(changesOf(before, after).map(line)).toEqual([
    'colours | scale {name} {"name":"brand"} | added',
    'colours | group {name} {"name":"status"} | changed | Surfaces | yes | no',
    'colours | the preset | changed | Smooth | no | yes',
  ])
  // yes and no are words of the studio, translated where they are drawn
  const surfaces = changesOf(before, after)[1]
  expect([surfaces.before, surfaces.after]).toEqual([
    { text: 'yes', word: true },
    { text: 'no', word: true },
  ])
  // a scale the preset deletes is written null: it is removed
  const deleted = preset()
  deleted.config.ratios = { wcag3: { brand: [10, 20, 30] } }
  const deleting = preset()
  deleting.config.ratios = { wcag3: { brand: null } }
  expect(changesOf(deleted, deleting).map(line)).toEqual(['colours | scale {name} {"name":"brand"} | removed'])
})

test('a value of the theme block is a change of a role, in Weights', () => {
  const before = preset()
  const after = preset()
  const theme = after.config.theme as {
    surfaces: Record<string, Record<string, string>>
    text: Record<string, number>
  }
  theme.surfaces.light.raised = '96%'
  theme.text.muted = 75
  const was = before.config.theme as typeof theme
  expect(changesOf(before, after).map(line)).toEqual([
    `weights | {role}, {mode} {"role":"surface-raised","mode":{"text":"light"}} | changed | ${was.surfaces.light.raised} | 96%`,
    `weights | text-muted | changed | ${was.text.muted} | 75`,
  ])
})

test('the choices of the Themes page are changes of a theme, in Themes', () => {
  const after = preset()
  after.choices = {
    names: { 'tone.bisque': 'warm' },
    accents: { 'tone.bisque': { brand: 'variant.primary' } },
    modes: { 'tone.bisque': ['light'] },
  }
  expect(changesOf({ ...preset(), choices: NO_THEME_CHOICES }, after).map(line)).toEqual([
    'themes | theme of {family} {"family":"tone.bisque"} | changed | Name | warm',
    'themes | theme of {family} {"family":"tone.bisque"} | changed | brand | variant.primary',
    'themes | theme of {family} {"family":"tone.bisque"} | changed | Modes | light',
  ])
})

test('the changes come in the order of the stages, whatever changed first', () => {
  const after = preset()
  after.choices = { ...NO_THEME_CHOICES, names: { 'tone.bisque': 'warm' } }
  ;(after.config.theme as { text: Record<string, number> }).text.default = 88
  after.config.colors[0].color = '#000000'
  expect(changesOf(preset(), after).map(({ stage }) => stage)).toEqual(['colours', 'weights', 'themes'])
})

test('a key of the preset the studio does not know is still a change, said as written', () => {
  const after = preset()
  after.config.transparent = { intensity: 0.8 }
  const [change] = changesOf(preset(), after)
  expect(line(change)).toBe('colours | the preset | changed | transparent')
  expect(change.field).toEqual({ text: 'transparent', plain: true })
})
