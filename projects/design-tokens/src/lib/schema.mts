import { Ajv, type ErrorObject } from 'ajv'
import { CURVE_PRESET_NAMES, HUE_SHIFT_EASINGS } from './hue-shift.mjs'

// Interpolation colorspaces Leonardo accepts: the schema enum, and the choices
// the studio (projects/studio) offers
// The colorspaces the engine builds a ramp in. CAM02, CAM02p and HSLuv left on 2026-11-18 (#1454):
// the vendored Leonardo maps no CAM02 to chroma-js ("Colorspace not supported"), and chroma-js 3
// has no interpolation mode hsluv, so a configuration that named one never generated.
export const COLORSPACES = ['HSL', 'OKLCH', 'LCH', 'LAB', 'OKLAB', 'RGB', 'HSV']

const hexColor = {
  type: 'string',
  pattern: '^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$',
}

const formula = { enum: ['wcag2', 'wcag3'] }

// A per-mode table of role -> lightness. Levels accept a percentage ("96%"),
// a bare 0..100 string, or a 0..1 number (see surface.mts parseLightness).
// anyOf, not a `type` array: Ajv's strict mode warns on union types at every
// use, and the schema is also published for consumers' validators
const lightness = { anyOf: [{ type: 'string' }, { type: 'number' }] }
const surfaceModeLevels = {
  type: 'object',
  additionalProperties: false,
  required: ['sunken', 'muted', 'default', 'raised', 'overlay'],
  properties: {
    sunken: lightness,
    muted: lightness,
    default: lightness,
    raised: lightness,
    overlay: lightness,
  },
}
const borderModeLevels = {
  type: 'object',
  additionalProperties: false,
  required: ['muted', 'default', 'strong'],
  properties: { muted: lightness, default: lightness, strong: lightness },
}
const surfaceLevels = {
  type: 'object',
  additionalProperties: false,
  required: ['light', 'dark'],
  properties: { light: surfaceModeLevels, dark: surfaceModeLevels },
}
const borderLevels = {
  type: 'object',
  additionalProperties: false,
  required: ['light', 'dark'],
  properties: { light: borderModeLevels, dark: borderModeLevels },
}
// Opt into lightness-based surface + border generation: `true` uses the global
// `theme` ramp, an object overrides the levels. Accepted at TWO levels - on a
// group (opts in every family of that group) and on a single color (which wins,
// so `false` opts one family back out of an opted-in group).
const surfaceOptIn = {
  oneOf: [
    { type: 'boolean' },
    {
      type: 'object',
      additionalProperties: false,
      properties: { surfaces: surfaceLevels, borders: borderLevels },
    },
  ],
}
// Opt into the band of a solid fill (state-color.mts, #1427): washes, text roles and the
// emphasis band. `{ dark: 'lightness' }` places the band in dark by lightness. On a group or on
// a single color, which wins, as for `surface`.
const emphasisOptIn = {
  oneOf: [
    { type: 'boolean' },
    {
      type: 'object',
      additionalProperties: false,
      properties: { dark: { enum: ['lightness'] } },
    },
  ],
}
// A text role is an APCA Lc target (number) or an explicit tone step (A7).
const textLevel = {
  oneOf: [
    { type: 'number' },
    {
      type: 'object',
      additionalProperties: false,
      required: ['step'],
      properties: { step: { type: 'number' } },
    },
  ],
}
const textLevels = {
  type: 'object',
  additionalProperties: false,
  required: ['default', 'muted', 'subtle', 'disabled'],
  properties: {
    default: textLevel,
    muted: textLevel,
    subtle: textLevel,
    disabled: textLevel,
  },
}

// the intensity across a scale, shared by the hue shift and the saturation curve (hue-shift.mts)
const curve = {
  oneOf: [
    { enum: CURVE_PRESET_NAMES },
    { type: 'array', items: { type: 'number' } },
    {
      type: 'object',
      additionalProperties: false,
      properties: {
        deadZone: { type: 'number' },
        easing: { enum: HUE_SHIFT_EASINGS },
      },
    },
  ],
}

const hueShift = {
  type: 'object',
  additionalProperties: false,
  properties: {
    dark: { type: 'number' },
    light: { type: 'number' },
    curve,
  },
}

// the saturation curve (saturation.mts): -100 grey, 100 the most vivid colour sRGB holds
const saturationAmount = { type: 'number', minimum: -100, maximum: 100 }
const saturation = {
  type: 'object',
  additionalProperties: false,
  properties: {
    dark: saturationAmount,
    light: saturationAmount,
    curve,
  },
}

// The JSON Schema for `.magma-design-tokensrc.json`. Single source of truth for
// hand-editing (editor autocomplete via `$schema`) and the validation of the
// studio (projects/studio).
export const CONFIG_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://magma-design-system.github.io/magma-design-tokensrc.schema.json',
  title: 'Magma design tokens configuration',
  type: 'object',
  required: ['colors'],
  additionalProperties: false,
  properties: {
    $schema: { type: 'string' },
    colorspace: { type: 'string', enum: COLORSPACES },
    smooth: { type: 'boolean' },
    formula,
    hueShift,
    saturation,
    ratios: {
      type: 'object',
      additionalProperties: false,
      properties: {
        wcag2: { $ref: '#/definitions/ratioData' },
        wcag3: { $ref: '#/definitions/ratioData' },
      },
    },
    groups: {
      type: 'object',
      additionalProperties: { $ref: '#/definitions/group' },
    },
    theme: {
      type: 'object',
      additionalProperties: false,
      required: ['surfaces', 'borders'],
      properties: {
        colorspace: { type: 'string', enum: COLORSPACES },
        surfaces: surfaceLevels,
        borders: borderLevels,
        text: textLevels,
      },
    },
    colors: {
      type: 'array',
      minItems: 1,
      items: { $ref: '#/definitions/color' },
    },
  },
  definitions: {
    ratioData: {
      type: 'object',
      additionalProperties: { type: 'array', items: { type: 'number' } },
    },
    group: {
      type: 'object',
      additionalProperties: false,
      properties: {
        ratios: { type: 'string' },
        formula,
        export: { type: 'array', items: { type: 'string' } },
        surface: surfaceOptIn,
        emphasis: emphasisOptIn,
      },
    },
    color: {
      type: 'object',
      additionalProperties: false,
      // `name` is always required; a family provides EITHER its own `color`
      // (a solved palette) OR an `alias` to another family (a reference), never
      // both and never neither.
      required: ['name'],
      oneOf: [{ required: ['color'] }, { required: ['alias'] }],
      properties: {
        color: hexColor,
        // dot-separated token path: <group>.<name>, e.g. tone.neutral
        name: { type: 'string', pattern: '^[^.]+\\.[^.]+$' },
        export: { type: 'array', items: { type: 'string' } },
        seed: {
          type: 'object',
          additionalProperties: false,
          required: ['light', 'dark'],
          properties: { light: hexColor, dark: hexColor },
        },
        disabled: { type: 'boolean' },
        title: { type: 'string' },
        // reference to another family, as a <group>.<name> token path
        alias: { type: 'string', pattern: '^[^.]+\\.[^.]+$' },
        ratios: { type: 'string' },
        formula,
        colorspace: { type: 'string', enum: COLORSPACES },
        smooth: { type: 'boolean' },
        hueShift,
        saturation,
        // per-family opt-in; overrides the group's (see `surfaceOptIn`)
        surface: surfaceOptIn,
        // per-family opt-in; overrides the group's (see `emphasisOptIn`)
        emphasis: emphasisOptIn,
      },
    },
  },
} as const

export interface ValidationResult {
  valid: boolean,
  errors: string[],
}

// compiled once: the schema never changes at runtime
const ajv = new Ajv({ allErrors: true })
const validate = ajv.compile(CONFIG_SCHEMA)

/** One Ajv error as a line: where it is in the document, and what is wrong there. */
export function formatError (error: ErrorObject): string {
  const path = error.instancePath || '(root)'
  return `${path} ${error.message ?? 'is invalid'}`
}

/**
 * Validate a design-tokens configuration against CONFIG_SCHEMA: the studio
 * refuses a configuration that does not match it.
 */
export function validateConfig (config: unknown): ValidationResult {
  const valid = validate(config) as boolean
  return {
    valid,
    errors: valid ? [] : (validate.errors ?? []).map(formatError),
  }
}
