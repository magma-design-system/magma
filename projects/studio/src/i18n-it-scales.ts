/*
  The Italian of Contrast scales, Semantic surface and the states preview (scales.tsx, surfaces.tsx, states.ts) (#1336), a part of the catalogue of the studio (i18n-it.ts): the English
  text it translates is the key, and a key lives in one part only (test/i18n.test.mts).
*/
export const IT_SCALES: Record<string, string> = {
  // the words several pages share (scales.tsx, surfaces.tsx)
  Light: 'Chiaro',
  Dark: 'Scuro',
  Cancel: 'Annulla',
  Name: 'Nome',
  Formula: 'Formula',
  OK: 'OK',
  Target: 'Obiettivo',

  // the Contrast scales page (scales.tsx)
  'Contrast scales define the target contrast of every step {against}: 0 sits on the background, the maximum is the strongest contrast (dark in light mode, light in dark mode). Colors pick a scale with their {ratios} field; the {default} scale is mandatory. Pick a distribution easing, or drag the markers / edit the numbers to go manual; Reset takes a scale back to the steps of the configuration loaded.':
    'Le scale di contrasto definiscono il contrasto obiettivo di ogni gradino {against}: 0 sta sullo sfondo, il massimo è il contrasto più forte (scuro in modalità chiara, chiaro in modalità scura). I colori scelgono una scala con il loro campo {ratios}; la scala {default} è obbligatoria. Scegli un easing di distribuzione, oppure trascina i marcatori / modifica i numeri per passare alla distribuzione manuale; Ripristina riporta una scala ai gradini della configurazione caricata.',
  'against the theme background': 'rispetto allo sfondo del tema',
  'wcag2 (ratio, 1-21)': 'wcag2 (rapporto, 1-21)',
  'The colors of a scale, by group': 'I colori di una scala, per gruppo',
  Scale: 'Scala',
  'No color uses this scale right now': 'Al momento nessun colore usa questa scala',
  '{name} ({color}) - click to use it as the sample color':
    '{name} ({color}) - fai clic per usarlo come colore campione',
  'The states beside the scales': 'Gli stati accanto alle scale',
  '{name} takes the ramp of {source} whatever its scale: the states of {source} show beside its scales.':
    '{name} prende la rampa di {source} qualunque sia la sua scala: gli stati di {source} compaiono accanto alle sue scale.',
  'Beside each scale, {name} solved on it paints the components it paints, in the theme {theme}.':
    'Accanto a ogni scala, {name} risolto su di essa dipinge i componenti che dipinge, nel tema {theme}.',
  '{name} paints no component of Magma: no variant of a component takes it, no theme points an accent at it and no theme is drawn from it.':
    '{name} non dipinge nessun componente di Magma: nessuna variante di un componente lo usa, nessun tema gli assegna un accento e nessun tema nasce da esso.',
  Mode: 'Modalità',
  'The states of {family} on the scale {scale}, light mode':
    'Gli stati di {family} sulla scala {scale}, modalità chiara',
  'The states of {family} on the scale {scale}, dark mode':
    'Gli stati di {family} sulla scala {scale}, modalità scura',
  // the card of a scale
  'Built-in': 'Integrata',
  'Built-in, overridden': 'Integrata, ridefinita',
  'shipped with magma; shown here because your config overrides its stops':
    'inclusa in magma; è qui perché la tua configurazione ne ridefinisce i gradini',
  'shipped with magma; shown even though it is not in your config':
    'inclusa in magma; è qui anche se non è nella tua configurazione',
  '{steps}, used by {colors}': '{steps}, usata da {colors}',
  '{count} step': '{count} gradino',
  '{count} steps': '{count} gradini',
  '{count} color': '{count} colore',
  '{count} colors': '{count} colori',
  'Actions of the scale {name}': 'Azioni della scala {name}',
  'dead zone: below Lc {clamp} APCA reports 0 and the step collapses toward the background':
    'zona morta: sotto Lc {clamp} APCA restituisce 0 e il gradino si schiaccia verso lo sfondo',
  'unreachable: above the {formula} ceiling ({ceiling}) the step clamps to the pure extreme':
    "irraggiungibile: oltre il limite di {formula} ({ceiling}) il gradino si ferma all'estremo puro",
  'step {step}: {value} - {issue}': 'gradino {step}: {value} - {issue}',
  'step {step}: {value}': 'gradino {step}: {value}',
  'The steps of {name}': 'I gradini di {name}',
  'Step {step}': 'Gradino {step}',
  'Remove step {step}': 'Rimuovi il gradino {step}',
  'remove step': 'rimuovi il gradino',
  'insert a step in the widest gap': 'inserisci un gradino nello spazio più ampio',
  'Add step': 'Aggiungi gradino',
  Distribution: 'Distribuzione',
  manual: 'manuale',
  Steps: 'Gradini',
  Min: 'Min',
  Max: 'Max',
  Reset: 'Ripristina',
  'the loaded configuration has no scale named {name}':
    'la configurazione caricata non ha nessuna scala di nome {name}',
  '{name} holds the steps of the loaded configuration':
    '{name} ha i gradini della configurazione caricata',
  'back to the steps of {name} in the loaded configuration, distribution manual':
    'torna ai gradini di {name} nella configurazione caricata, distribuzione manuale',
  'selected color rendered with this scale, ordered like the axis: 0 (background side) to max contrast':
    "colore selezionato reso con questa scala, nell'ordine dell'asse: da 0 (lato dello sfondo) al contrasto massimo",
  // the menu of a scale and its dialogs
  Rename: 'Rinomina',
  'rename scale': 'rinomina la scala',
  'the default scale is mandatory and cannot be renamed':
    'la scala default è obbligatoria e non si può rinominare',
  'built-in scales cannot be renamed': 'le scale integrate non si possono rinominare',
  Duplicate: 'Duplica',
  Delete: 'Elimina',
  'delete scale': 'elimina la scala',
  'the default scale is mandatory': 'la scala default è obbligatoria',
  'used by {count} color: deleting reassigns them to the default scale':
    'usata da {count} colore: se la elimini, passa alla scala default',
  'used by {count} colors: deleting reassigns them to the default scale':
    'usata da {count} colori: se la elimini, passano alla scala default',
  'Add scale': 'Aggiungi scala',
  'Rename the scale {name}': 'Rinomina la scala {name}',
  'Write a name': 'Scrivi un nome',
  'A scale named "{name}" exists already': 'Esiste già una scala di nome "{name}"',
  'The colors and the groups that use the scale take the new name':
    'I colori e i gruppi che usano la scala prendono il nuovo nome',
  'Delete the scale {name}?': 'Vuoi eliminare la scala {name}?',
  'The scale "{name}" is used by {count} color: deleting it reassigns them to the "default" scale.':
    'La scala "{name}" è usata da {count} colore: se la elimini, passa alla scala "default".',
  'The scale "{name}" is used by {count} colors: deleting it reassigns them to the "default" scale.':
    'La scala "{name}" è usata da {count} colori: se la elimini, passano alla scala "default".',

  // the states beside a scale (states.ts)
  '{tag}, variant {variant}': '{tag}, variante {variant}',
  'Tone {tone}': 'Tono {tone}',
  'The text of a message of the page.': 'Il testo di un messaggio della pagina.',

  // the Semantic surface page (surfaces.tsx)
  "Surfaces and borders are placed by perceptual {lightness} in OKLCH (not APCA), per mode and per role. Opt a family in below; the shared ramp is the same for every family (the tint comes from each family's key color). The active default tint is chosen in {styles}, not here. Every family you opt in here also becomes a theme on the Themes page, whatever its group, except the status ones.":
    'Superfici e bordi si collocano per {lightness} percettiva in OKLCH (non APCA), per modalità e per ruolo. Attiva una famiglia qui sotto; la rampa condivisa è la stessa per ogni famiglia (la tinta viene dal colore chiave di ciascuna). La tinta predefinita attiva si sceglie in {styles}, non qui. Ogni famiglia che attivi qui diventa anche un tema nella pagina Temi, qualunque sia il suo gruppo, tranne quelle di stato.',
  lightness: 'luminosità',
  'Surface groups': 'Gruppi di superfici',
  'A whole group at once: every family in it generates a {surface}, {border} and {text} scale.':
    'Un intero gruppo in una volta: ogni sua famiglia genera una scala {surface}, {border} e {text}.',
  '{group} always generates surfaces: its components paint text on their own tinted background, so the pair needs a generated text role to be legible by construction':
    '{group} genera sempre superfici: i suoi componenti dipingono il testo sul proprio sfondo tinto, quindi la coppia ha bisogno di un ruolo del testo generato per essere leggibile per costruzione',
  'always on': 'sempre attivo',
  'Surface families': 'Famiglie di superfici',
  'Refine the groups above per family: a family with no flag of its own follows its group. Each one you opt in here also becomes a theme.':
    'Affina i gruppi qui sopra famiglia per famiglia: una famiglia senza una scelta propria segue il suo gruppo. Ogni famiglia che attivi qui diventa anche un tema.',
  '{name} (follows the {group} group)': '{name} (segue il gruppo {group})',
  'via {group}': 'tramite {group}',
  'Status, never a theme.': 'Stato, mai un tema.',
  '{lead} These families generate surfaces so that banners, toasts and badges get a text role legible on their own tint; a theme drawn from one would paint the whole interface in a status colour, and the page would mix with the messages that colour carries.':
    "{lead} Queste famiglie generano superfici perché banner, toast e badge abbiano un ruolo del testo leggibile sulla loro tinta; un tema nato da una di esse dipingerebbe l'intera interfaccia in un colore di stato, e la pagina si confonderebbe con i messaggi che quel colore porta.",
  'Status families': 'Famiglie di stato',
  // the levels
  'Lightness levels (%)': 'Livelli di luminosità (%)',
  'The shared ramp for surfaces and borders, per mode; the text targets are an APCA Lc, the same in both modes.':
    'La rampa condivisa di superfici e bordi, per modalità; gli obiettivi del testo sono un Lc APCA, lo stesso in entrambe le modalità.',
  'Text (APCA Lc)': 'Testo (APCA Lc)',
  'Text {role}, target': 'Testo {role}, obiettivo',
  'step {step} (pinned)': 'gradino {step} (fissato)',
  Surfaces: 'Superfici',
  Borders: 'Bordi',
  // what each role is for
  'wells, insets, code blocks, tracks (recessed)':
    'pozzetti, riquadri interni, blocchi di codice, tracce (incassata)',
  'same-plane grouping: zebra rows, subtle sections':
    'raggruppamenti sullo stesso piano: righe alternate, sezioni discrete',
  'the canvas / page background': 'il canvas / lo sfondo della pagina',
  'cards, panels, sticky headers (lifted)': 'card, pannelli, intestazioni fisse (sollevata)',
  'modal, dropdown, popover, tooltip, sheet (top)':
    'modale, dropdown, popover, tooltip, sheet (in cima)',
  'decorative: grid, dividers, cell/row borders (softest)':
    'decorativo: griglia, divisori, bordi di celle/righe (il più tenue)',
  'functional outlines: inputs, buttons': 'contorni funzionali: campi, pulsanti',
  'assertive / state: selected, focus, error': 'deciso / stato: selezionato, focus, errore',
  'body / primary data (highest contrast)': 'corpo / dati principali (contrasto più alto)',
  'secondary ESSENTIAL text: address, phone (stays legible)':
    'testo secondario ESSENZIALE: indirizzo, telefono (resta leggibile)',
  'non-essential: captions, hints, units': 'non essenziale: didascalie, suggerimenti, unità',
  'disabled / inactive (lowest)': 'disabilitato / inattivo (il più basso)',
  // the preview
  'No family opts into surfaces yet: turn one on above to preview it.':
    'Ancora nessuna famiglia genera superfici: attivane una qui sopra per vederla in anteprima.',
  'Preview family': 'Famiglia in anteprima',
  'Preview shadow': 'Ombra in anteprima',
  'The shadow is a Magma {shadow} on the surface boxes below (preview only, not a token).':
    "L'ombra è una {shadow} di Magma sui riquadri delle superfici qui sotto (solo anteprima, non un token).",
  Surface: 'Superficie',
  'Text-role step selection': 'Scelta del gradino dei ruoli del testo',
  'The worst-case APCA Lc of each tone step; the engine picks the {least} step whose bar clears a target. Edit the targets (or the surface levels) and the pick moves.':
    "L'APCA Lc nel caso peggiore di ogni gradino di tono; il motore sceglie il gradino {least} la cui barra supera un obiettivo. Modifica gli obiettivi (o i livelli delle superfici) e la scelta si sposta.",
  'least-contrast': 'con meno contrasto',
  '{mode}: no tone/surface scale': '{mode}: nessuna scala di tono o di superficie',
  '{role} target {target}': 'obiettivo di {role}: {target}',
  'tone {color} on its worst surface: {role} {surface}':
    'tono {color} sulla sua superficie peggiore: {role} {surface}',
  '{mode} - canvas {color}': '{mode} - canvas {color}',
  'No tone scale of its own, so this surface shows the default NEUTRAL ink (foreground = active counterpart of surface). Check the Lc to see if the neutral ink is legible on this surface.':
    "Nessuna scala di tono propria, quindi questa superficie mostra l'inchiostro NEUTRO predefinito (primo piano = controparte attiva della superficie). Controlla il Lc per vedere se l'inchiostro neutro è leggibile su questa superficie.",
  'inherits neutral ink': "eredita l'inchiostro neutro",
  '{purpose} - Lc {lc} is below the {floor} legibility floor':
    '{purpose} - Lc {lc} è sotto la soglia di leggibilità {floor}',
  '{purpose} - Lc {lc} out-contrasts {above} (Lc {aboveLc}); a lower role must stay softer':
    '{purpose} - Lc {lc} supera il contrasto di {above} (Lc {aboveLc}); un ruolo più basso deve restare più tenue',
  '{purpose} - Lc {lc} OK (floor {floor})': '{purpose} - Lc {lc} OK (soglia {floor})',
  'under Lc {floor}': 'sotto Lc {floor}',
  'over {role}': 'oltre {role}',
  '{ratio}:1 on the surface below; decorative, no ratio floor':
    '{ratio}:1 sulla superficie sottostante; decorativo, nessuna soglia di rapporto',
  '{ratio}:1 on the surface below, OK (floor {floor}:1, WCAG 1.4.11)':
    '{ratio}:1 sulla superficie sottostante, OK (soglia {floor}:1, WCAG 1.4.11)',
  '{ratio}:1 on the surface below is under the {floor}:1 floor for a border that conveys state (WCAG 1.4.11)':
    '{ratio}:1 sulla superficie sottostante è sotto la soglia di {floor}:1 per un bordo che comunica uno stato (WCAG 1.4.11)',
  'under {ratio}:1': 'sotto {ratio}:1',
};
