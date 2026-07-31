import { Ajv, type ErrorObject } from 'ajv'

// Interpolation colorspaces Leonardo accepts (kept in sync with the playground)
const COLORSPACES = [
  'HSL', 'OKLCH', 'LCH', 'LAB', 'OKLAB', 'CAM02', 'CAM02p', 'HSLuv', 'RGB', 'HSV',
]

const hexColor = {
  type: 'string',
  pattern: '^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$',
}

const formula = { enum: ['wcag2', 'wcag3'] }

// A per-mode table of role -> lightness. Levels accept a percentage ("96%"),
// a bare 0..100 string, or a 0..1 number (see surface.mts parseLightness).
const lightness = { type: ['string', 'number'] }
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

const hueShift = {
  type: 'object',
  additionalProperties: false,
  properties: {
    dark: { type: 'number' },
    light: { type: 'number' },
    curve: {
      oneOf: [
        { enum: ['smooth', 'hard'] },
        { type: 'array', items: { type: 'number' } },
        {
          type: 'object',
          additionalProperties: false,
          properties: {
            deadZone: { type: 'number' },
            easing: { enum: ['linear', 'step'] },
          },
        },
      ],
    },
  },
}

// The JSON Schema for `.magma-design-tokensrc.json`. Single source of truth for
// hand-editing (editor autocomplete via `$schema`), the `ui` server and the
// playground validation.
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
        // opt into lightness-based surface + border generation: `true` uses the
        // global `theme` ramp, an object overrides levels for this family
        surface: {
          oneOf: [
            { type: 'boolean' },
            {
              type: 'object',
              additionalProperties: false,
              properties: { surfaces: surfaceLevels, borders: borderLevels },
            },
          ],
        },
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

function formatError (error: ErrorObject): string {
  const path = error.instancePath || '(root)'
  return `${path} ${error.message ?? 'is invalid'}`
}

/**
 * Validate a design-tokens configuration against CONFIG_SCHEMA. Shared by the
 * CLI `ui` server and the playground so both reject the same inputs.
 */
export function validateConfig (config: unknown): ValidationResult {
  const valid = validate(config) as boolean
  return {
    valid,
    errors: valid ? [] : (validate.errors ?? []).map(formatError),
  }
}
