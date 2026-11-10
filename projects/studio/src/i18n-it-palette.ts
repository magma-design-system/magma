/*
  The Italian of the Palette and the frame of the pages of Colors (app.tsx, the Config menu, Diffs, the batch export, the bridges of magma.tsx, the preview beside the Palette, the draft) (#1336), a part of the catalogue of the studio (i18n-it.ts): the English
  text it translates is the key, and a key lives in one part only (test/i18n.test.mts).
*/
export const IT_PALETTE: Record<string, string> = {
  // the Palette: the list of the families and the family selected (app.tsx)
  'hue shifting of its own, over the global one':
    'spostamento di tonalità proprio, sopra quello globale',
  'hue shifting active': 'spostamento di tonalità attivo',
  '{value} - contrast {ratio}:1': '{value} - contrasto {ratio}:1',
  'color token: {value}': 'token di colore: {value}',
  seed: 'base',
  'Inherit global (active)': 'Eredita il globale (attivo)',
  'Inherit global (off)': 'Eredita il globale (disattivato)',
  Custom: 'Personalizzato',
  Off: 'Disattivato',
  'Hue shifting': 'Spostamento di tonalità',
  'Global hue shifting': 'Spostamento di tonalità globale',
  Curve: 'Curva',
  'Dead zone': 'Zona morta',
  Easing: 'Andamento',
  'The two ends': 'I due estremi',
  Ends: 'Estremi',
  'Dark (degrees)': 'Scuro (gradi)',
  'Light (degrees)': 'Chiaro (gradi)',
  'Shift intensity per step (10-step scale)':
    'Intensità dello spostamento per gradino (scala di 10 gradini)',
  'shift intensity per step (10-step scale)':
    'intensità dello spostamento per gradino (scala di 10 gradini)',
  'Export groups': 'Gruppi di esportazione',
  'e.g. tones, default': 'es. tones, default',
  '{name} (missing)': '{name} (mancante)',
  'Built-in variant: it cannot be renamed': 'Variante integrata: non si può rinominare',
  // a contrast scale, in the selects of the Palette, Contrast scales and Groups (la scala)
  '{name} (built-in)': '{name} (integrata)',
  '{name} (built-in, overridden)': '{name} (integrata, ridefinita)',
  Reference: 'Riferimento',
  References: 'Riferimenti',
  'Resolves to': 'Si risolve in',
  unresolved: 'non risolto',
  'Reference to {name}: this family re-exports the resolved scale of the source. Base color, hue shift, ratios and formula are defined by the source, not here.':
    'Riferimento a {name}: questa famiglia riesporta la rampa risolta della sorgente. Colore base, spostamento di tonalità, rapporti e formula sono definiti dalla sorgente, non qui.',
  'The hue shifting of a reference is the one of the family it points at, {name}: set it there, and every reference to it follows.':
    'Lo spostamento di tonalità di un riferimento è quello della famiglia a cui punta, {name}: impostalo lì, e ogni riferimento a essa lo segue.',
  'Open {name}': 'Apri {name}',
  'Base color': 'Colore base',
  Colorspace: 'Spazio colore',
  inherit: 'eredita',
  Smooth: 'Morbida',
  'alias target "{name}" is not defined in this config':
    'la famiglia di riferimento "{name}" non è definita in questa configurazione',
  'alias target "{name}" is itself a reference; point it at a base-color family':
    'la famiglia di riferimento "{name}" è a sua volta un riferimento; puntalo a una famiglia con un colore base',
  'Actions of {name}': 'Azioni di {name}',
  'Delete color': 'Elimina colore',
  'built-in variant: cannot be deleted': 'variante integrata: non si può eliminare',
  'Global settings': 'Impostazioni globali',
  'The families of colour': 'Le famiglie di colore',
  'Add color': 'Aggiungi colore',
  'New reference': 'Nuovo riferimento',
  'New color': 'Nuovo colore',
  Kind: 'Tipo',
  'Own color': 'Colore proprio',
  'No base-color family to reference yet.':
    'Ancora nessuna famiglia con un colore base a cui fare riferimento.',
  'A reference follows another family instead of solving a palette.':
    "Un riferimento segue un'altra famiglia invece di risolvere una palette.",
  Color: 'Colore',
  Group: 'Gruppo',
  'Add reference': 'Aggiungi riferimento',

  // the line under the title of each page of Colors (app.tsx)
  'The families of colour of the configuration, each solved into a ramp of steps in light and dark.':
    'Le famiglie di colore della configurazione, ognuna risolta in una rampa di gradini in chiaro e in scuro.',
  'The contrast ratios the families solve their steps at, against the background of the mode.':
    'I rapporti di contrasto a cui le famiglie risolvono i loro gradini, rispetto allo sfondo della modalità.',
  'The families that generate surfaces, and the balances: the lightness of the surfaces and borders, the targets of the text.':
    'Le famiglie che generano superfici, e gli equilibri: la luminosità delle superfici e dei bordi, gli obiettivi del testo.',
  'Each family with surfaces, status aside, is a theme: its name, its accents and the CSS that switches it in.':
    'Ogni famiglia con superfici, tranne quelle di stato, è un tema: il suo nome, i suoi accenti e il CSS che lo attiva.',
  'The ratios, formula and export of each group of the configuration.':
    "I rapporti, la formula e l'esportazione di ogni gruppo della configurazione.",
  'Every pair the contrast gate judges, in each theme and both modes: what the build of Magma would say of this configuration.':
    'Ogni coppia giudicata dalla verifica del contrasto, in ogni tema e in entrambe le modalità: quello che la build di Magma direbbe di questa configurazione.',
  'The palette against the configuration Magma builds with.':
    'La palette a confronto con la configurazione con cui si compila Magma.',

  // the head of the pages, its saving and the draft restored (app.tsx, draft.ts)
  'Discard the loaded configuration and every local change, back to the one Magma builds with':
    'Scarta la configurazione caricata e ogni modifica locale, e torna a quella con cui si compila Magma',
  Save: 'Salva',
  'Save *': 'Salva *',
  'Saving...': 'Salvataggio...',
  Saved: 'Salvato',
  'Read-only': 'Sola lettura',
  'Read-only *': 'Sola lettura *',
  saved: 'salvato',
  'save failed': 'salvataggio non riuscito',
  'save failed ({status})': 'salvataggio non riuscito ({status})',
  'building...': 'generazione in corso...',
  'build failed': 'generazione non riuscita',
  'build failed ({status})': 'generazione non riuscita ({status})',
  'tokens generated on disk': 'token generati su disco',
  'Saving is off: {reason}': 'Il salvataggio è disattivato: {reason}',
  '{reason}, and the draft restored from this browser has edits of its own.':
    '{reason}, e la bozza ripristinata da questo browser ha modifiche proprie.',
  'Use the file on disk': 'Usa il file su disco',
  'Use the bundled config': 'Usa la configurazione inclusa',
  'Keep the draft': 'Tieni la bozza',
  'the bundled config': 'la configurazione inclusa',
  // the places of these sentences are never after a preposition (draft.ts, DraftReason)
  'this draft comes from an older studio and may not match {source}':
    'questa bozza viene da una versione precedente dello studio e la sua base potrebbe non essere {source}',
  'this draft was made on {from}, the studio now shows {source}':
    'questa bozza ha come base {from}, ora lo studio mostra {source}',
  '{source} was removed after this draft was saved':
    '{source} è stato rimosso dopo il salvataggio di questa bozza',
  '{source} was created after this draft was saved':
    '{source} è stato creato dopo il salvataggio di questa bozza',
  '{source} changed after this draft was saved':
    '{source} ha subito modifiche dopo il salvataggio di questa bozza',

  // what brings a configuration in and takes it out (app.tsx, config-menu.tsx), and the button of
  // the gate dialog that runs it anyway (contrast.tsx)
  'Import config': 'Importa configurazione',
  'it does not match the schema': 'non corrisponde allo schema',
  'Could not load {file}: {error}': 'Impossibile caricare {file}: {error}',
  'Warning: {hex} is already used by "{name}"': 'Attenzione: {hex} è già usato da "{name}"',
  'Copy JSON': 'Copia JSON',
  'Copied!': 'Copiato!',
  'Download all tokens': 'Scarica tutti i token',
  'Download config': 'Scarica configurazione',
  'Download Figma tokens': 'Scarica token per Figma',
  'Download CSS tokens': 'Scarica token CSS',
  'Download GIMP palette': 'Scarica palette GIMP',
  'Build tokens on disk': 'Genera token su disco',
  'Download anyway': 'Scarica comunque',
  'Build anyway': 'Genera comunque',
  'Save anyway': 'Salva comunque',
  'Export anyway': 'Esporta comunque',
  'Could not build the CSS: {error}': 'Impossibile generare il CSS: {error}',
  'Could not build the palette: {error}': 'Impossibile generare la palette: {error}',
  'Could not build the Figma tokens: {error}': 'Impossibile generare i token per Figma: {error}',
  'Could not build the zip: {error}': 'Impossibile generare lo zip: {error}',
  'Could not export the selection: {error}': 'Impossibile esportare la selezione: {error}',

  // the export of a selection of colours (batch.tsx)
  'Batch export ({count})': 'Esportazione multipla ({count})',
  'The colors of the batch': "I colori dell'esportazione",
  'Comma-separated, e.g. city, palette': 'Separati da virgole, es. city, palette',
  'Export selection': 'Esporta selezione',
  'Save export': 'Salva esportazione',

  // the Diffs page (diff.tsx)
  'Differences between the current palette and the one generated from the committed configuration. Changed steps are outlined; the badge shows the largest perceptual distance (deltaE) across the color.':
    'Le differenze tra la palette attuale e quella generata dalla configurazione con cui si compila Magma. I gradini cambiati sono contornati; il badge mostra la distanza percettiva più grande (deltaE) tra i gradini del colore.',
  'No differences from the committed configuration.':
    'Nessuna differenza dalla configurazione con cui si compila Magma.',
  // label and count, so Italian needs no agreement with the count
  '{changed} changed, {added} new, {removed} removed':
    'cambiati: {changed}, nuovi: {added}, rimossi: {removed}',
  new: 'nuovo',
  removed: 'rimosso',
  '{step}: {from} to {to}': '{step}: da {from} a {to}',
  '{step}: added ({value})': '{step}: aggiunto ({value})',
  '{step}: {value} (unchanged)': '{step}: {value} (invariato)',

  // the side of the Palette: the ramps or the theme on a page (palette-side.tsx)
  Ramps: 'Rampe',
  Show: 'Mostra',
  'The family, as ramps or as a theme': 'La famiglia, come rampe o come tema',
  'The side of the Palette': 'Il pannello laterale della Palette',
  'The theme {theme} on a page of a product': 'Il tema {theme} su una pagina di un prodotto',
  '{list} and {last}': '{list} e {last}',
  '{name} is the family of the theme {theme}, whose surfaces are the whole page':
    "{name} è la famiglia del tema {theme}, le cui superfici sono l'intera pagina",
  'it paints the variant {variants}': 'dipinge la variante {variants}',
  'it paints the variants {variants}': 'dipinge le varianti {variants}',
  '{name} paints the variant {variants}': '{name} dipinge la variante {variants}',
  '{name} paints the variants {variants}': '{name} dipinge le varianti {variants}',
  'through {families}': 'tramite {families}',
  '{paints}, first in the page: {elements}': '{paints}, in testa alla pagina: {elements}',
  '{paints}, which no element of the page takes': '{paints}, che nessun elemento della pagina usa',
};
