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

  // the bar and its menu (shell.tsx)
  'for Magma v{version}': 'per Magma v{version}',
  Colors: 'Colori',
  Theme: 'Tema',
  // Regole, not Comportamento: the pages of the section are rules (of composition, patterns,
  // blocks), and Comportamento with Configurazione does not fit the bar at 768px (vittorio,
  // 2026-11-10)
  Behavior: 'Regole',
  Config: 'Configurazione',
  Studio: 'Studio',
  Preferences: 'Preferenze',

  // the pages of the sections (routes.ts)
  Palette: 'Palette',
  'Contrast scales': 'Scale di contrasto',
  'Semantic surface': 'Superficie semantica',
  Themes: 'Temi',
  Groups: 'Gruppi',
  'Contrast check': 'Verifica del contrasto',
  Diffs: 'Differenze',
  'Design language': 'Linguaggio di design',
  Patterns: 'Pattern',
  Blocks: 'Blocchi',
  // the Theme section (shell.tsx)
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

  // the pages of Behavior (shell.tsx)
  'The rules of composition every page of a product follows: rhythm, density, actions, titles, surfaces and widths.':
    'Le regole di composizione che ogni pagina di un prodotto segue: ritmo, densità, azioni, titoli, superfici e larghezze.',
  'How a task across components is solved in every product, with the narrower values a product keeps in its magma/patterns folder.':
    'Come ogni prodotto risolve un compito che attraversa più componenti, con i valori più stretti che un prodotto tiene nella sua cartella magma/patterns.',
  'The sections of a page that come back in two patterns or more: the application shell, the page header, the lists.':
    "Le sezioni di una pagina che tornano in due pattern o più: la struttura dell'applicazione, l'intestazione della pagina, gli elenchi.",
  'Read-only, after the theme': 'In sola lettura, dopo il tema',
  'This page shows what Magma decided and the layer of the product, in the theme of the product. It comes after the Theme section (#693, "The plan").':
    'Questa pagina mostra quello che Magma ha deciso e il livello del prodotto, nel tema del prodotto. Arriva dopo la sezione Tema (#693, "The plan").',
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

  // the Start page (start.tsx, start-demo.ts)
  'Themes in light and dark, or in one mode of your choice':
    'Temi in chiaro e scuro, o in una sola modalità a tua scelta',
  'Contrast checked by itself at every edit': 'Contrasto verificato da solo a ogni modifica',
  'Colour ramps you shape step by step': 'Rampe di colore che modelli gradino per gradino',
  'Exports for Figma, the design system, CSS and GIMP':
    'Esportazioni per Figma, il design system, CSS e GIMP',
  Texts: 'Testi',
  Icons: 'Icone',
  Actions: 'Azioni',
  'Meets {target}': 'Raggiunge {target}',
  'Below {target}': 'Sotto {target}',
  'The theme of your product, readable by everyone': 'Il tema del tuo prodotto, leggibile da tutti',
  'Magma Studio is where a product shapes its theme on Magma. You state how much contrast the text needs, and the studio picks the colours that meet it, in every theme and both modes.':
    'Magma Studio è dove un prodotto dà forma al suo tema su Magma. Tu dici quanto contrasto serve al testo, e lo studio sceglie i colori che lo raggiungono, in ogni tema e in entrambe le modalità.',
  'The text, the icon and the main action of this banner are under their contrast targets.':
    "Il testo, l'icona e l'azione principale di questo banner sono sotto i loro obiettivi di contrasto.",
  'A banner of a product, painted with the configuration of the animation':
    "Un banner di un prodotto, dipinto con la configurazione dell'animazione",
  'The contrast issues are fixed: the gate of Magma passes.':
    'I problemi di contrasto sono risolti: la verifica di Magma passa.',
  Replay: 'Rivedi',
  'A banner painted with the configuration Magma builds with, drawn pale: its text pinned to pale steps of its ramp, under the floors of the contrast gate, and the ramp of its accent faded, so its text, its icon and its main action read poorly. Then the studio brings both back step by step, solving the colours again at each one, until every pair the gate judges meets its floor.':
    "Un banner dipinto con la configurazione con cui si compila Magma, resa pallida: il suo testo fissato su gradini chiari della sua rampa, sotto le soglie della verifica del contrasto, e la rampa del suo accento sbiadita, così il testo, l'icona e l'azione principale si leggono male. Poi lo studio li riporta indietro gradino per gradino, risolvendo di nuovo i colori a ogni passo, finché ogni coppia giudicata dalla verifica raggiunge la sua soglia.",
  'How the work goes': 'Come si lavora',
  'Start from a configuration': 'Parti da una configurazione',
  'The studio opens on the configuration Magma builds with. Import your own from the Config menu of the bar: your edits stay in this browser as a draft until you reset them.':
    'Lo studio si apre sulla configurazione con cui si compila Magma. Importa la tua dal menu Configurazione della barra: le tue modifiche restano in questo browser come bozza finché non le azzeri.',
  'Continue on {page}': 'Continua su {page}',
  'Open the palette': 'Apri la palette',
  'Change it where the change belongs': 'Fai ogni modifica al suo livello',
  'Each section works at one level, from one colour to the whole product. Make a change at the narrowest level that holds it: the levels after it follow.':
    "Ogni sezione lavora a un livello, da un colore all'intero prodotto. Fai una modifica al livello più stretto che la contiene: i livelli dopo di esso la seguono.",
  'Keep the contrast gate green': 'Tieni verde la verifica del contrasto',
  'The gate of the build of Magma judges every edit. The badge beside each title of Colors, and the count on its menu, say how many pairs fall below their floor.':
    'La verifica della build di Magma giudica ogni modifica. Il badge accanto a ogni titolo di Colori, e il numero sul suo menu, dicono quante coppie scendono sotto la loro soglia.',
  'Judge it on a product, then take it': 'Giudicalo su un prodotto, poi portalo via',
  'The Theme section shows the theme on a page of a product, in both modes and under the preferences of a person. The Config menu of the bar hands over what a product loads: the configuration, the tokens, the Figma tokens.':
    'La sezione Tema mostra il tema su una pagina di un prodotto, in entrambe le modalità e con le preferenze di una persona. Il menu Configurazione della barra consegna quello che un prodotto carica: la configurazione, i token, i token per Figma.',
  'Where each change is made': 'Dove si fa ogni modifica',
  'From one colour to the whole product. Each level is built on the one before, so a change reaches every level after it.':
    "Da un colore all'intero prodotto. Ogni livello è costruito su quello prima, quindi una modifica raggiunge ogni livello dopo di esso.",
  Colour: 'Colore',
  Role: 'Ruolo',
  Product: 'Prodotto',
  Composition: 'Composizione',
  'One family of colour, or a group of them': 'Una famiglia di colore, o un loro gruppo',
  'The roles every theme shares': 'I ruoli che ogni tema condivide',
  'One theme': 'Un tema',
  'Every page of every product': 'Ogni pagina di ogni prodotto',
  'The base colour of a family, the contrast ratios its ramp of steps is solved at in light and dark, the formula and the export of its group.':
    "Il colore base di una famiglia, i rapporti di contrasto a cui si risolve la sua rampa di gradini in chiaro e in scuro, la formula e l'esportazione del suo gruppo.",
  'The families that generate surfaces, the lightness of the surfaces and the borders, the contrast target of each role of the text.':
    "Le famiglie che generano superfici, la luminosità delle superfici e dei bordi, l'obiettivo di contrasto di ogni ruolo del testo.",
  'The family a theme is drawn from, its name, the accents it repoints and the colour modes it is used in.':
    'La famiglia da cui nasce un tema, il suo nome, gli accenti che ridefinisce e le modalità di colore in cui si usa.',
  'What the theme is judged under: the mode, more contrast, the preferences of a person, the width of the page. Typography, shape, density and depth come next.':
    'Le condizioni in cui si giudica il tema: la modalità, più contrasto, le preferenze di una persona, la larghezza della pagina. Tipografia, forma, densità e profondità arrivano dopo.',
  'Nothing: these pages read what Magma decided, the design language, the patterns and the blocks, and the layer of the product.':
    'Niente: queste pagine leggono quello che Magma ha deciso, il linguaggio di design, i pattern e i blocchi, e il livello del prodotto.',
  'Every step of the family, and every role and theme that paints with it.':
    'Ogni gradino della famiglia, e ogni ruolo e tema che dipinge con essa.',
  'Every surface, border and text of every theme: the studio picks the step of each ramp that meets each target.':
    'Ogni superficie, bordo e testo di ogni tema: lo studio sceglie il gradino di ogni rampa che raggiunge ogni obiettivo.',
  'The pages of a product that switch the theme in, with data-theme-name.':
    'Le pagine di un prodotto che attivano il tema, con data-theme-name.',
  'Nothing is saved from here yet: it is where a theme is judged as a whole.':
    'Da qui non si salva ancora nulla: è dove un tema si giudica nel suo insieme.',
  'How the pages of a product are put together, whatever the theme.':
    'Come si compongono le pagine di un prodotto, qualunque sia il tema.',
  'You act on': 'Agisci su',
  'It reaches': 'Raggiunge',
  'The pages of {level}': 'Le pagine di {level}',
  'At every level, {check} lists every pair the gate judges, and {diffs} compares the palette with the one Magma builds with.':
    'A ogni livello, {check} elenca ogni coppia giudicata dalla verifica, e {diffs} confronta la palette con quella con cui si compila Magma.',
};

/** The catalogue: every part, each key in one of them. */
export const IT: Record<string, string> = {
  ...IT_SHELL,
  ...IT_PALETTE,
  ...IT_SCALES,
  ...IT_THEMES,
};
