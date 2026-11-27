/*
  The Italian of Themes and Groups (themes.tsx, groups.tsx, and the summary of the gate,
  gate-summary.tsx) (#1336), a part of the catalogue of the studio (i18n-it.ts): the English text
  it translates is the key, and a key lives in one part only (test/i18n.test.mts). Contrast check
  keeps its own (features/contrast-check/i18n-it.ts, #1401).
*/
export const IT_THEMES: Record<string, string> = {
  // the Themes page (themes.tsx)
  'Light only': 'Solo chiaro',
  'Dark only': 'Solo scuro',
  'lowercase words joined by hyphens, as editorial or my-product':
    'parole minuscole unite da trattini, come editorial o my-product',
  '{name} is a theme Magma ships: pick a name of your own':
    '{name} è un tema fornito da Magma: scegli un nome tuo',
  'the theme drawn from {family} is named {name} already':
    'il tema tratto da {family} si chiama già {name}',
  "Each family opted into a surface (Semantic surface), whatever its group, is a theme with a name of its own, except the status ones, which would mix with the messages they colour: {base}, drawn from {tint}, is the base {root}, and every other one switches in via {attribute}, repointing the whole {block} block (surface + border + text) to its family. The names of the themes Magma ships are reserved. An accent is a role that points at a {variant}; a theme may repoint it - pick a variant per role below and the accent retints with the theme. Any tint works; text comes from the family's own scale.":
    "Ogni famiglia che genera superfici (Superficie semantica), qualunque sia il suo gruppo, è un tema con un nome suo, tranne quelle di stato, che si confonderebbero con i messaggi che colorano: {base}, tratto da {tint}, è la base {root}, e ogni altro tema si attiva con {attribute}, che ridefinisce l'intero blocco {block} (superficie + bordo + testo) sulla sua famiglia. I nomi dei temi forniti da Magma sono riservati. Un accento è un ruolo che punta a una {variant}; un tema può ridefinirlo: scegli qui sotto una variante per ruolo e l'accento cambia tinta con il tema. Va bene qualsiasi tinta; il testo viene dalla scala della famiglia stessa.",
  'Only the base theme so far: opt another family into a surface (Semantic surface) and it appears here as a theme.':
    "Per ora c'è solo il tema base: attiva le superfici di un'altra famiglia (Superficie semantica) e comparirà qui come tema.",
  Export: 'Esportazione',
  'Paste into a styles theme file; the {default} is the base {root} from {file}, so only the overrides are emitted.':
    "Incollalo in un file di tema di styles: {default} è la base {root} di {file}, quindi l'esportazione contiene solo le ridefinizioni.",
  'Copy CSS': 'Copia CSS',
  'Copy anyway': 'Copia comunque',
  Copied: 'Copiato',
  'The CSS of the themes': 'Il CSS dei temi',
  base: 'base',
  shipped: 'di Magma',
  'a theme Magma ships: its name is reserved': 'un tema fornito da Magma: il suo nome è riservato',
  'drawn from {family}': 'tratto da {family}',
  'The accents of {theme}': 'Gli accenti di {theme}',
  '{variant} (base)': '{variant} (base)',
  changed: 'modificato',
  override: 'ridefinito',
  Modes: 'Modalità',
  '{family} has no surface+text scale.': '{family} non ha una scala di superficie e testo.',
  'not offered by the theme': 'non offerto dal tema',
  'Test in {mode}': 'Prova in {mode}',
  'Test in {mode}, {theme}': 'Prova in {mode}, {theme}',

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

  // the dialog of an export while the gate fails (features/contrast-check) and the summary of
  // the gate (gate-summary.tsx)
  'and {count} more': 'e ancora {count}',
  'See every pair': 'Vedi tutte le coppie',
  // the verdict of the gate beside the controls of the balances (gate-summary.tsx, #1418)
  'Contrast gate': 'Verifica del contrasto',
  '{fg} on {bg}, {mode}: {achieved} under {target}':
    '{fg} su {bg}, {mode}: {achieved} sotto {target}',
  'in {count} theme': 'in {count} tema',
  'in {count} themes': 'in {count} temi',
};
