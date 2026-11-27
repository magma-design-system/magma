/*
  The Italian of the studio (#1336), by the English text it translates (i18n.ts). The studio
  speaks to the person with "tu", as the Italian of the Magma components does ("Hai caricato",
  "Seleziona"). The words that come back on every page keep one Italian form, the glossary of the
  README ("Languages"). The catalogue is in parts, by the pages they translate: this file holds the
  shell and what the modules share, the pages of Colors have a file each (i18n-it-*.ts), and the
  previews keep their own (i18n-it-previews.ts, i18n-previews.ts).
*/
import { IT_PALETTE } from './i18n-it-palette.js';
import { IT_SCALES } from './i18n-it-scales.js';
import { IT_THEMES } from './i18n-it-themes.js';

/** The Italian of the shell, the Start page, the verdict and the names the modules share. */
export const IT_SHELL: Record<string, string> = {
  // the names of the supporting modules (hue-ends.ts, paints.ts, states.ts)
  Free: 'Libere',
  Mirror: 'Speculari',
  Linked: 'Collegate',
  Status: 'Stato',
  Label: 'Etichetta',
  Accent: 'Accento',
  Neutral: 'Neutro',
  Rest: 'Riposo',
  Hover: 'Hover',
  Pressed: 'Premuto',
  Selected: 'Selezionato',
  Disabled: 'Disabilitato',

  // the bar and its menu (app/shell.tsx)
  'for Magma v{version}': 'per Magma v{version}',
  Colors: 'Colori',
  Theme: 'Tema',
  // Regole, not Comportamento: the pages of the section are rules (of composition, patterns,
  // blocks), and Comportamento with Configurazione does not fit the bar at 768px (vittorio,
  // 2026-11-10)
  Behavior: 'Regole',
  Studio: 'Studio',
  Preferences: 'Preferenze',

  // the pages of the sections (shared/routes/routes.ts)
  'Semantic surface': 'Superficie semantica',
  Themes: 'Temi',
  Groups: 'Gruppi',
  'Contrast check': 'Verifica del contrasto',
  'Design language': 'Linguaggio di design',
  Patterns: 'Pattern',
  Blocks: 'Blocchi',
  // the stages in order (shared/routes/routes.ts, app/stages.tsx), with the names of the
  // register (GLOSSARY.md): the stepper, the foot of a stage, the exit (state/exports.ts)
  Stages: 'Passi',
  'The stage before and after': 'Il passo prima e quello dopo',
  'Beside {stage}': 'Accanto a {stage}',
  Weights: 'Pesi',
  Exceptions: 'Eccezioni',
  'Full review': 'Giro completo',
  Opening: 'Partenza',
  // the toast that undoes an opening (app/shell.tsx, state/opening.ts)
  "You opened Magma's preset.": 'Hai aperto il preset di Magma.',
  'You opened a theme of yours from {theme}.': 'Hai aperto un tuo tema da {theme}.',
  'You opened a theme of yours from {colour}.': 'Hai aperto un tuo tema dal colore {colour}.',
  'You opened {file}.': 'Hai aperto {file}.',
  Undo: 'Annulla',
  // a pair of the contrast check, in Contrast check and in Colours
  '{fg} on {bg}': '{fg} su {bg}',
  // the badge of a contrast scale, in Colours and in Scale (#1403)
  'Compatible with Magma': 'Compatibile con Magma',
  'Not compatible with Magma': 'Non compatibile con Magma',
  // the link to the page of a scale, in Colours and in Groups
  'Open the scale {scale}': 'Apri la scala {scale}',
  // the pairs of the contrast check a family or a scale touches (shared/ui/touched-pairs.tsx)
  '{count} pair touched': '{count} coppia toccata',
  '{count} pairs touched': '{count} coppie toccate',
  'all above their floor, in light and in dark': 'tutte sopra la soglia, in chiaro e in scuro',
  '{count} under its floor': '{count} sotto la soglia',
  '{count} under their floor': '{count} sotto la soglia',
  '{count} pair accepted by the baseline': '{count} accettata dalla baseline',
  '{count} pairs accepted by the baseline': '{count} accettate dalla baseline',
  'No pair of the contrast check: it changes none.':
    'Nessuna coppia della verifica: non ne cambia nessuna.',
  'Measuring the pairs it touches...': 'Misuro le coppie che tocca...',
  passes: 'passa',
  fails: 'non passa',
  'accepted by the baseline': 'accettata dalla baseline',
  'below its target': "sotto l'obiettivo",
  'measured, not judged': 'misurata, non giudicata',
  'The pairs it touches': 'Le coppie che tocca',
  // a family deleted, undone from a toast of the shell (#1403)
  '{name} deleted.': '{name} eliminato.',
  'The scale {name} deleted.': 'Scala {name} eliminata.',
  'The scale {name} back to its {count} built-in steps.':
    'La scala {name} è tornata ai suoi {count} gradini integrati.',
  // the name of a new group (engine/families.ts, groupNameProblem)
  'Write the name of the group.': 'Scrivi il nome del gruppo.',
  'A letter first, then letters, digits and hyphens: it names the tokens.':
    'Prima una lettera, poi lettere, cifre e trattini: dà il nome ai token.',
  'The engine makes a group by this name from the families: choose another.':
    'Il motore crea un gruppo con questo nome dalle famiglie: scegline un altro.',
  'The group variant holds references alone.': 'Il gruppo variant contiene solo riferimenti.',
  // the indicators of the play of the introduction, a column of Semantic surface
  Texts: 'Testi',
  'Save the preset': 'Salva il preset',
  'Download the preset': 'Scarica il preset',
  // the changes in the bar (app/changes.tsx), what changed (engine/changes.ts)
  Preset: 'Preset',
  'No changes': 'Nessuna modifica',
  '{count} change': '{count} modifica',
  '{count} changes': '{count} modifiche',
  '{count} change since the last exit': "{count} modifica dall'ultima uscita",
  '{count} changes since the last exit': "{count} modifiche dall'ultima uscita",
  'No changes since the last exit.': "Nessuna modifica dall'ultima uscita.",
  // what entered or left the preset: a family, a scale, a group, so no agreement with a gender
  'new in the preset': 'entra nel preset',
  'gone from the preset': 'esce dal preset',
  '{field}: from {before} to {after}': '{field}: da {before} a {after}',
  'from {before} to {after}': 'da {before} a {after}',
  '{field}: now {after}': '{field}: ora {after}',
  'now {after}': 'ora {after}',
  '{field}: was {before}': '{field}: era {before}',
  'was {before}': 'era {before}',
  '{field}: a new value': '{field}: un valore nuovo',
  'a new value': 'un valore nuovo',
  'Base colour': 'Colore base',
  'Contrast scale': 'Scala di contrasto',
  'Hue shift': 'Spostamento di tonalità',
  'scale {name}': 'scala {name}',
  'group {name}': 'gruppo {name}',
  '{role}, {mode}': '{role}, {mode}',
  'theme of {family}': 'tema di {family}',
  'the preset': 'il preset',
  yes: 'sì',
  no: 'no',
  // the Theme section (theme-section.tsx)
  Typography: 'Tipografia',
  Shape: 'Forma',
  Density: 'Densità',
  Depth: 'Profondità',
  'Preferences of the person': 'Preferenze della persona',
  Dimension: 'Dimensione',
  Scenes: 'Scene',
  'The theme on a page of a product': 'Il tema su una pagina di un prodotto',
  'The theme on every component': 'Il tema su ogni componente',
  Desktop: 'Desktop',
  Tablet: 'Tablet',
  Mobile: 'Mobile',
  'Full width': 'Larghezza piena',
  Width: 'Larghezza',
  Preview: 'Anteprima',
  View: 'Vista',
  '{theme} is light only': '{theme} è solo in modalità chiara',
  '{theme} is dark only': '{theme} è solo in modalità scura',
  '{title}, light mode': '{title}, modalità chiara',
  '{title}, dark mode': '{title}, modalità scura',
  Accessibility: 'Accessibilità',
  'Light and dark': 'Chiaro e scuro',

  // the verdict of the contrast gate (verdict.tsx)
  'All contrasts are OK': 'Tutti i contrasti sono OK',
  '{count} contrast below target': "{count} contrasto sotto l'obiettivo",
  '{count} contrasts below target': "{count} contrasti sotto l'obiettivo",
  'Contrast not measured': 'Contrasto non misurato',
  '{count} known offender accepted by the baseline of design-tokens':
    '{count} eccezione nota accettata dalla baseline di design-tokens',
  '{count} known offenders accepted by the baseline of design-tokens':
    '{count} eccezioni note accettate dalla baseline di design-tokens',
  'Every pair the contrast gate judges meets its target, in every theme and mode':
    'Ogni coppia giudicata dalla verifica del contrasto raggiunge il suo obiettivo, in ogni tema e modalità',
  'The pairs are on the Contrast check page': 'Le coppie sono nella pagina Verifica del contrasto',
  light: 'chiaro',
  dark: 'scuro',
  '{mode}: not offered': '{mode}: non offerto',
  '{mode}: {count} below target': "{mode}: {count} sotto l'obiettivo",
  '{mode}: OK': '{mode}: OK',
  'The contrast gate on {theme}': 'La verifica del contrasto su {theme}',
};

/** The catalogue: every part, each key in one of them. */
export const IT: Record<string, string> = {
  ...IT_SHELL,
  ...IT_PALETTE,
  ...IT_SCALES,
  ...IT_THEMES,
};
