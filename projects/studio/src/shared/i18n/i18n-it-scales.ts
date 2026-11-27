/*
  The Italian of the pieces of Contrast scales that Scale keeps (features/scale/scale-parts.tsx),
  the states preview (states.ts) and the canvas of the surfaces (shared/ui/surface-canvas.tsx)
  (#1336, #1403), a part of the catalogue of the studio (i18n-it.ts): the English text it
  translates is the key, and a key lives in one part only (test/i18n.test.mts).
*/
export const IT_SCALES: Record<string, string> = {
  // the words several pages share
  Light: 'Chiaro',
  Dark: 'Scuro',
  Cancel: 'Annulla',
  Name: 'Nome',
  Formula: 'Formula',
  OK: 'OK',
  Target: 'Obiettivo',

  // the Contrast scales page (scales.tsx)
  'wcag2 (ratio, 1-21)': 'wcag2 (rapporto, 1-21)',
  Scale: 'Scala',
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
  // the menu of a scale and its dialogs
  Rename: 'Rinomina',
  'built-in scales cannot be renamed': 'le scale integrate non si possono rinominare',
  Duplicate: 'Duplica',
  Delete: 'Elimina',
  'the default scale is mandatory': 'la scala default è obbligatoria',
  'Rename the scale {name}': 'Rinomina la scala {name}',
  'Write a name': 'Scrivi un nome',
  'A scale named "{name}" exists already': 'Esiste già una scala di nome "{name}"',
  'The colors and the groups that use the scale take the new name':
    'I colori e i gruppi che usano la scala prendono il nuovo nome',

  // the states beside a scale (states.ts)
  '{tag}, variant {variant}': '{tag}, variante {variant}',
  'Tone {tone}': 'Tono {tone}',
  'The text of a message of the page.': 'Il testo di un messaggio della pagina.',

  // the groups of the weights (features/weights, engine/changes.ts)
  Surfaces: 'Superfici',
  Borders: 'Bordi',
  // what each role is for (shared/ui/surface-canvas.tsx, the words of the render of Weights)
  'wells, insets': 'pozzetti, riquadri interni',
  'zebra rows, sections': 'righe alternate, sezioni',
  'the canvas of the page': 'il canvas della pagina',
  'cards, panels': 'card, pannelli',
  'modal, dropdown, tooltip': 'modale, dropdown, tooltip',
  'dividers, cells': 'divisori, celle',
  'fields, buttons': 'campi, pulsanti',
  'selected, focus, error': 'selezionato, focus, errore',
  'body, primary data': 'corpo, dati principali',
  'essential secondary text': 'testo secondario essenziale',
  'captions, hints': 'didascalie, suggerimenti',
  disabled: 'disabilitato',
  // the canvas of a mode
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
