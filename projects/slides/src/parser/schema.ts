import { Ajv, type ValidateFunction } from 'ajv';
import type { Deck } from '../model/types.js';
import schema from '../schema/deck.schema.json' with { type: 'json' };

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const ajv = new Ajv({ allErrors: true, strict: false });
ajv.addSchema(schema, 'deck');

const validateDeckConfig = ajv.getSchema('deck#/$defs/deckConfig') as ValidateFunction;
const validateSlideConfig = ajv.getSchema('deck#/$defs/slideConfig') as ValidateFunction;

/**
 * Validate a parsed {@link Deck} against the JSON Schema contract: the deck
 * frontmatter and every slide's frontmatter. Returns a flat list of
 * human-readable errors (empty when valid).
 */
export function validateDeck(deck: Deck): ValidationResult {
  const errors: string[] = [];

  if (!validateDeckConfig(deck.config)) {
    errors.push(...formatErrors('deck', validateDeckConfig));
  }

  for (const slide of deck.slides) {
    if (!validateSlideConfig(slide.config)) {
      errors.push(...formatErrors(`slide[${slide.index}]`, validateSlideConfig));
    }
  }

  return { valid: errors.length === 0, errors };
}

function formatErrors(scope: string, validate: ValidateFunction): string[] {
  return (validate.errors ?? []).map((e) => {
    const path = e.instancePath || '/';
    return `${scope}${path}: ${e.message ?? 'invalid'}`;
  });
}
