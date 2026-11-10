/*
  The Italian of Themes, Groups and Contrast check (themes.tsx, groups.tsx, contrast.tsx) (#1336), a part of the catalogue of the studio (i18n-it.ts): the English
  text it translates is the key, and a key lives in one part only (test/i18n.test.mts).
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
  'Ratios, formula and export are managed per token group here (the {groups} section of the configuration). Tick colors across groups to set their export together, or pick an existing export to load every color that uses it. Group selected lifts the ticked colors into a section on top, to compare them.':
    "Qui rapporti, formula ed esportazione si gestiscono per gruppo di token (la sezione {groups} della configurazione). Spunta colori di gruppi diversi per impostarne insieme l'esportazione, o scegli un'esportazione esistente per caricare ogni colore che la usa. Raggruppa selezionati porta i colori spuntati in una sezione in alto, per confrontarli.",
  // "Selezionati: 3", not "3 selezionati": the English has one form for every count, so the
  // Italian takes the one that agrees with every count
  '{count} selected': 'Selezionati: {count}',
  'Batch export': 'Esportazione multipla',
  'Group selected': 'Raggruppa selezionati',
  'Select by export': 'Seleziona per esportazione',
  'Choose an export': "Scegli un'esportazione",
  Ratios: 'Rapporti',
  'inherit ({value})': 'eredita ({value})',
  'e.g. palette, default': 'es. palette, default',
  'Selected colors': 'Colori selezionati',
  'All the colors of the group are in the {section} section.':
    'Tutti i colori del gruppo sono nella sezione {section}.',

  // the Contrast check page and the dialog of an export while the gate fails (contrast.tsx)
  'Text on the surfaces': 'Testo sulle superfici',
  'Every text role on every surface of the theme.':
    'Ogni ruolo del testo su ogni superficie del tema.',
  'Text on the solid fills': 'Testo sui riempimenti pieni',
  'The on-emphasis text of each hue on its fill and the states of the fill, on-inverse on the muted inverse surface.':
    'Il testo on-emphasis di ogni tonalità sul suo riempimento e sugli stati del riempimento, on-inverse sulla superficie inversa attenuata.',
  'Text of a hue on its washes': 'Testo di una tonalità sulle sue velature',
  'The text of each status hue on its own washes: enforced where the wash carries that text, reported where it does not.':
    'Il testo di ogni tonalità di stato sulle sue velature: verificato dove la velatura porta quel testo, segnalato dove non lo porta.',
  'Text on the neutral washes': 'Testo sulle velature neutre',
  'The text roles on the washes of the neutral band: enforced where the wash carries that text, reported where it does not.':
    'I ruoli del testo sulle velature della banda neutra: verificati dove la velatura porta quel testo, segnalati dove non lo porta.',
  'Coloured text on the surfaces': 'Testo colorato sulle superfici',
  'The text of each hue on the page and on a card. Reported, not enforced.':
    'Il testo di ogni tonalità sulla pagina e su una card. Segnalato, non verificato.',
  'Borders on the surfaces': 'Bordi sulle superfici',
  'The WCAG 2 ratio of each border on the page and on a card: a border of state is reported under 3:1, a decorative one has no floor.':
    'Il rapporto WCAG 2 di ogni bordo sulla pagina e su una card: un bordo di stato è segnalato sotto 3:1, uno decorativo non ha soglia.',
  'meets its target': 'raggiunge il suo obiettivo',
  'under {measure}': 'sotto {measure}',
  'under its target: the contrast gate fails, the build of Magma refuses the theme':
    'sotto il suo obiettivo: la verifica del contrasto fallisce, la build di Magma rifiuta il tema',
  accepted: 'accettata',
  'under its target, accepted by the baseline of design-tokens as a known offender':
    'sotto il suo obiettivo, accettata dalla baseline di design-tokens come eccezione nota',
  'under its target: the gate reports it, it does not fail on it':
    'sotto il suo obiettivo: la verifica la segnala, ma non fallisce per questo',
  'no floor': 'nessuna soglia',
  'a decorative border: no ratio floor, WCAG 1.4.11 is for the borders that convey state':
    'un bordo decorativo: nessuna soglia di rapporto, WCAG 1.4.11 riguarda i bordi che comunicano uno stato',
  'not offered': 'non offerto',
  'measured, not judged: the theme is not used in this mode':
    'misurata, non giudicata: il tema non si usa in questa modalità',
  '{light} light, {dark} dark': '{light} in chiaro, {dark} in scuro',
  enforced: 'verificata',
  reported: 'segnalata',
  '{fg} on {bg}': '{fg} su {bg}',
  Pair: 'Coppia',
  'The pairs and the targets of {command}, in every theme of the Themes page. A mode a theme is not offered in is measured, not judged.':
    'Le coppie e gli obiettivi di {command}, in ogni tema della pagina Temi. Una modalità in cui un tema non è offerto si misura, ma non si giudica.',
  '{count} pair below target: the build of Magma would refuse this configuration.':
    "{count} coppia sotto l'obiettivo: la build di Magma rifiuterebbe questa configurazione.",
  '{count} pairs below target: the build of Magma would refuse this configuration.':
    "{count} coppie sotto l'obiettivo: la build di Magma rifiuterebbe questa configurazione.",
  'Every enforced pair meets its target: {measured} measures in {count} theme.':
    'Ogni coppia verificata raggiunge il suo obiettivo: {measured} misure in {count} tema.',
  'Every enforced pair meets its target: {measured} measures in {count} themes.':
    'Ogni coppia verificata raggiunge il suo obiettivo: {measured} misure in {count} temi.',
  'Only the pairs below their target': 'Solo le coppie sotto il loro obiettivo',
  'Every pair meets its target.': 'Ogni coppia raggiunge il suo obiettivo.',
  'Export with {count} contrast below target?':
    "Esportare con {count} contrasto sotto l'obiettivo?",
  'Export with {count} contrasts below target?':
    "Esportare con {count} contrasti sotto l'obiettivo?",
  '{action} hands out a configuration that fails the contrast gate of design-tokens: the build of Magma would refuse it, and these pairs are hard to read.':
    'L\'azione "{action}" consegna una configurazione che non supera la verifica del contrasto di design-tokens: la build di Magma la rifiuterebbe, e queste coppie si leggono male.',
  '{theme}, {mode}: {fg} on {bg}, {achieved} under {target}':
    '{theme}, {mode}: {fg} su {bg}, {achieved} sotto {target}',
  'and {count} more': 'e ancora {count}',
  'See every pair': 'Vedi tutte le coppie',
};
