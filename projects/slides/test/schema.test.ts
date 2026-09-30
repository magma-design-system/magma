import { describe, expect, it } from 'vitest';
import { parseDeck } from '../src/parser/parse.js';
import { validateDeck } from '../src/parser/schema.js';

describe('validateDeck', () => {
  it('accepts a valid deck', () => {
    const deck = parseDeck(
      `---\ntitle: Ok\ntheme: business\nscheme: dark\nheader: true\nfooter: true\ngroup: G\n---\n\n# Hi\n`,
    );
    expect(validateDeck(deck)).toEqual({ valid: true, errors: [] });
  });

  it('rejects an unknown theme', () => {
    const deck = parseDeck(`---\ntheme: neon\n---\n\n# Hi\n`);
    const result = validateDeck(deck);
    expect(result.valid).toBe(false);
    expect(result.errors.join('\n')).toMatch(/deck\/theme/);
  });

  it('rejects the retired theme-suffix scheme and footer object', () => {
    const deck = parseDeck(`---\ntheme: business-dark\nfooter:\n  group: G\n---\n\n# Hi\n`);
    const errors = validateDeck(deck).errors.join('\n');
    expect(errors).toMatch(/deck\/theme/);
    expect(errors).toMatch(/deck\/footer/);
  });

  it('rejects an unknown scheme', () => {
    const deck = parseDeck(`---\nscheme: sepia\n---\n\n# Hi\n`);
    expect(validateDeck(deck).errors.join('\n')).toMatch(/deck\/scheme/);
  });

  it('lists exactly the themes the package ships', async () => {
    const { readdirSync } = await import('node:fs');
    const { default: schema } = await import('../src/schema/deck.schema.json', {
      with: { type: 'json' },
    });
    const dir = new URL('../src/theme/themes/', import.meta.url);
    const shipped = readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    expect([...schema.$defs.theme.enum].sort()).toEqual(shipped);
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
