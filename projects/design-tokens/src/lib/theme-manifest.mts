import { Ajv } from 'ajv'

import { formatError, type ValidationResult } from './schema.mjs'

/*
  The public theme format (#694): a theme as data, so a product can keep it in its own
  repository (`magma/themes/<name>.json`), version it, hand it back to Magma and load it into the
  studio. Magma ships its own themes in this format (`themes/<name>.json` of this package, read by
  `semantic.config.ts`): what it asks of the products, it uses first.

  A manifest carries INTENT, never output: the family and the accent each role takes, not the
  generated colours. The CSS comes from it through the same engine as every other block of the
  semantic layer (`semantic.model.ts`), so a theme has one dialect, whoever holds it.

  `format` is the version of this shape, not of Magma: a reader refuses a format it does not know
  instead of guessing. The dimensions other than colour (corner shape, dimension, depth) join
  `color` as groups of their own when Magma has them.
*/

// The names `mds-pref-theme` accepts (its `handleNameChange`), the same check as THEME_NAME in
// semantic.model.ts: the name is part of custom-property names (`--magma-preview-<name>-wash`).
const themeName = { type: 'string', pattern: '^[a-z]+(-[a-z]+)*$' }

// A family of the palette as the CSS names it: `<name>` of `--surface-<name>-*` for a tint,
// `<group>-<name>` (`variant-secondary`) for an accent. Either way, part of a custom-property name.
const family = { type: 'string', pattern: '^[a-z0-9]+(-[a-z0-9]+)*$' }

// An accent role, a key of `accents` in semantic.config.ts (`accent`, `ai`).
const accentRole = { pattern: '^[a-z]+(-[a-z]+)*$' }

// Published in dist/config as magma-theme.schema.json, for the editors and the validators of
// the products that keep a theme.
export const THEME_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://magma-design-system.github.io/magma-theme.schema.json',
  title: 'Magma theme',
  type: 'object',
  required: ['format', 'name', 'color'],
  additionalProperties: false,
  properties: {
    $schema: { type: 'string' },
    format: { const: 1 },
    name: themeName,
    // what the theme is for, in one line: the left column of the studio shows it
    description: { type: 'string' },
    color: {
      type: 'object',
      required: ['tint'],
      additionalProperties: false,
      properties: {
        // the family the neutral scaffolding takes: surfaces, borders, text and the ramp
        tint: family,
        // accent role -> the family it takes; a role left out keeps the accent of the base
        accents: { type: 'object', propertyNames: accentRole, additionalProperties: family },
      },
    },
  },
} as const

/** A theme in the public format: see THEME_SCHEMA, which holds the same shape. */
export interface ThemeManifest {
  $schema?: string,
  format: 1,
  name: string,
  description?: string,
  color: {
    tint: string,
    accents?: Record<string, string>,
  },
}

// compiled once: the schema never changes at runtime
const ajv = new Ajv({ allErrors: true })
const validate = ajv.compile(THEME_SCHEMA)

/** Validate a theme against THEME_SCHEMA. */
export function validateTheme (theme: unknown): ValidationResult {
  const valid = validate(theme) as boolean
  return {
    valid,
    errors: valid ? [] : (validate.errors ?? []).map(formatError),
  }
}

/**
 * A theme, validated: on one it cannot take it throws every error, with the name of the theme.
 * `accentRoles`, when given, are the roles the layer has (the keys of `accents` in
 * semantic.config.ts): a theme repoints them, it never adds one.
 */
export function readTheme (theme: unknown, accentRoles?: readonly string[]): ThemeManifest {
  const { valid, errors } = validateTheme(theme)
  if (valid && accentRoles) {
    const roles = Object.keys((theme as ThemeManifest).color.accents ?? {})
    errors.push(
      ...roles
        .filter((role) => !accentRoles.includes(role))
        .map((role) => `/color/accents/${role} is not an accent role of the layer (${accentRoles.join(', ')})`),
    )
  }
  if (errors.length > 0) {
    const name = (theme as { name?: unknown } | null)?.name
    const label = typeof name === 'string' ? `"${name}"` : '(no name)'
    throw new Error(
      `the theme ${label} is not a Magma theme:\n${errors.map((error) => `  ${error}`).join('\n')}`,
    )
  }
  return theme as ThemeManifest
}

/**
 * The entry `semantic.config.ts` keeps for a theme (its `ThemeDef`): the tint is what the config
 * calls the surface family, and the accents carry over as they are.
 */
export function themeDefOf ({ color: { tint, accents } }: ThemeManifest): {
  surface: string,
  accents?: Record<string, string>,
} {
  return accents ? { surface: tint, accents } : { surface: tint }
}
