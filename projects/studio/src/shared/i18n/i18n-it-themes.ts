/*
  The Italian of what the themes share and of Groups (#1336), a part of the catalogue of the studio
  (i18n-it.ts): the English text it translates is the key, and a key lives in one part only
  (test/i18n.test.mts). The stage Themes and the full review keep their own
  (features/themes/i18n-it.ts, features/full-review/i18n-it.ts, #1404).
*/
export const IT_THEMES: Record<string, string> = {
  // the problems of the name of a theme, said by the engine (engine/themes.ts)
  'lowercase words joined by hyphens, as editorial or my-product':
    'parole minuscole unite da trattini, come editorial o my-product',
  '{name} is a theme Magma ships: pick a name of your own':
    '{name} è un tema fornito da Magma: scegli un nome tuo',
  'the theme drawn from {family} is named {name} already':
    'il tema tratto da {family} si chiama già {name}',
  // the words the changes of the bar and Groups share with the themes
  Export: 'Esportazione',
  Modes: 'Modalità',
  override: 'ridefinito',

  // the Groups page (groups.tsx)
  'overrides the group: {overrides}': 'diverso dal gruppo: {overrides}',
  // "Selezionati: 3", not "3 selezionati": the English has one form for every count, so the
  // Italian takes the one that agrees with every count
  '{count} selected': 'Selezionati: {count}',
  'Batch export': 'Esportazione multipla',
  'Group selected': 'Raggruppa selezionati',
  'Select by export': 'Seleziona per esportazione',
  'Choose an export': "Scegli un'esportazione",
  'inherit ({value})': 'eredita ({value})',
  'e.g. palette, default': 'es. palette, default',
  'Selected colors': 'Colori selezionati',
  'All the colors of the group are in the {section} section.':
    'Tutti i colori del gruppo sono nella sezione {section}.',

  // the dialog of an export while the gate fails (features/full-review)
  'Copy anyway': 'Copia comunque',
  'and {count} more': 'e ancora {count}',
  'See every pair': 'Vedi tutte le coppie',
};
