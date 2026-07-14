import { describe, expect, it } from 'vitest';
import { parseDeck } from '../src/parser/parse.js';
import { validateDeck } from '../src/parser/schema.js';

describe('validateDeck', () => {
  it('accepts a valid deck', () => {
    const deck = parseDeck(`---\ntitle: Ok\ntheme: maggioli\n---\n\n# Hi\n`);
    expect(validateDeck(deck)).toEqual({ valid: true, errors: [] });
  });

  it('rejects an unknown theme', () => {
    const deck = parseDeck(`---\ntheme: neon\n---\n\n# Hi\n`);
    const result = validateDeck(deck);
    expect(result.valid).toBe(false);
    expect(result.errors.join('\n')).toMatch(/deck\/theme/);
  });

  it('rejects an unknown layout on a slide', () => {
    const deck = parseDeck(`---\ntitle: D\n---\n\n---\nlayout: carousel\n---\n\nbody\n`);
    const result = validateDeck(deck);
    expect(result.valid).toBe(false);
    expect(result.errors.join('\n')).toMatch(/slide\[\d+\]\/layout/);
  });

  it('rejects a malformed token key', () => {
    const deck = parseDeck(`---\ntokens:\n  color: red\n---\n\n# Hi\n`);
    const result = validateDeck(deck);
    expect(result.valid).toBe(false);
  });
});
