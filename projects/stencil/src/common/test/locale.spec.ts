import { Locale } from '@common/locale';
import { preferenceStore } from '@common/preference';

// #1089: a page in it-IT got the English texts, only a bare it matched a language of the config
describe('Locale', () => {
  const t = new Locale({
    en: { hello: 'Hello', items: ['{{count}} item', '{{count}} items'] },
    it: { hello: 'Ciao', items: ['{{count}} elemento', '{{count}} elementi'] },
  });

  afterEach(() => {
    preferenceStore.state.language = 'en';
  });

  it.each(['it', 'it-IT', 'it-CH', 'IT', 'it_IT'])(
    'gives %s the texts of its language',
    (language) => {
      preferenceStore.state.language = language;

      expect(t.get('hello')).toBe('Ciao');
      expect(t.get('items', { count: 2 })).toBe('2 elementi');
    },
  );

  // #1433: the phrase goes into an attribute or a text node, where an entity is never decoded
  it('puts the values in as they are, without escaping them as HTML', () => {
    const named = new Locale({ en: { select: 'Select {{label}}', both: '{{a}} and {{b}}' } });

    expect(named.get('select', { label: "Credenziali dell'applicazione" })).toBe(
      "Select Credenziali dell'applicazione",
    );
    expect(named.get('select', { label: 'server/tool' })).toBe('Select server/tool');
    expect(named.get('both', { a: 'R&D <beta>', b: '"quoted"' })).toBe('R&D <beta> and "quoted"');
  });

  it.each(['pt-BR', 'de', ''])(
    'gives %s, a language it has no texts for, the English ones',
    (language) => {
      preferenceStore.state.language = language;

      expect(t.get('hello')).toBe('Hello');
      expect(t.get('items', { count: 1 })).toBe('1 item');
    },
  );
});
