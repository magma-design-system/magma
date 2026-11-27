/*
  The Italian of the full review and of the dialog of an export while the gate fails
  (full-review.tsx, pairs.tsx, gate-dialog.tsx; the Contrast check page of #1401 until #1404), by
  the English text it translates: the page hands
  it to the translator, which looks here before the catalogue of the studio
  (shared/i18n/i18n-it.ts). A key lives in one part only (test/i18n.test.mts).
*/
export const IT_FULL_REVIEW: Record<string, string> = {
  'Text on the surfaces': 'Testo sulle superfici',
  'Text on the solid fills': 'Testo sui riempimenti pieni',
  'Text of a hue on its washes': 'Testo di una tonalità sulle sue velature',
  'Text on the neutral washes': 'Testo sulle velature neutre',
  'Coloured text on the surfaces': 'Testo colorato sulle superfici',
  'Borders on the surfaces': 'Bordi sulle superfici',
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
  enforced: 'verificata',
  reported: 'segnalata',
  Pair: 'Coppia',
  'Export with {count} contrast below target?':
    "Esportare con {count} contrasto sotto l'obiettivo?",
  'Export with {count} contrasts below target?':
    "Esportare con {count} contrasti sotto l'obiettivo?",
  '{action} hands out a configuration that fails the contrast gate of design-tokens: the build of Magma would refuse it, and these pairs are hard to read.':
    'L\'azione "{action}" consegna una configurazione che non supera la verifica del contrasto di design-tokens: la build di Magma la rifiuterebbe, e queste coppie si leggono male.',
  '{theme}, {mode}: {fg} on {bg}, {achieved} under {target}':
    '{theme}, {mode}: {fg} su {bg}, {achieved} sotto {target}',
  // the full review (full-review.tsx, #1404)
  'not looked at': 'da guardare',
  'looked at': 'guardato',
  'changed after you looked': 'cambiato dopo che lo hai guardato',
  Blocking: 'Bloccano',
  'No pair blocks.': 'Nessuna coppia blocca.',
  'Under their floor: the build of Magma refuses the preset while one is here.':
    "Sotto la soglia: la build di Magma rifiuta il preset finché ce n'è una.",
  Reported: 'Segnalate',
  'No pair is reported.': 'Nessuna coppia segnalata.',
  'Under their target, reported by the check: they do not block.':
    "Sotto l'obiettivo, segnalate dalla verifica: non bloccano.",
  Debt: 'Debito',
  'No debt.': 'Nessun debito.',
  'Under their floor, accepted by the baseline of design-tokens: the debt in view, with how much is missing.':
    'Sotto la soglia, accettate dalla baseline di design-tokens: il debito in vista, con quanto manca.',
  'Judge every theme in every mode before the exit.':
    'Giudica ogni tema in ogni modalità prima di uscire.',
  '{looked} of {items} looked at': 'Guardati {looked} su {items}',
  // "Cambiati dopo: 2", not "2 cambiati": one English form for every count
  '{count} changed after you looked': 'cambiati dopo che li hai guardati: {count}',
  '{count} blocks the exit': "{count} blocca l'uscita",
  '{count} block the exit': "{count} bloccano l'uscita",
  'none blocks the exit': "nessuno blocca l'uscita",
  'The themes to look at, mode by mode': 'I temi da guardare, modalità per modalità',
  '{theme}, {mode}: {look}': '{theme}, {mode}: {look}',
  '{count} blocks': '{count} blocca',
  '{count} block': '{count} bloccano',
  '{theme}, {mode}': '{theme}, {mode}',
  'Looked at': 'Guardato',
  'Changed after you looked': 'Cambiato dopo che lo hai guardato',
  'A change touched this theme in this mode after you looked at it: look at it again.':
    'Una modifica ha toccato questo tema in questa modalità dopo che lo hai guardato: guardalo di nuovo.',
  'Look at the scene beside and at the pairs below, then mark it. The theme is in {themes}.':
    'Guarda la scena accanto e le coppie qui sotto, poi segnalo. Il tema è in {themes}.',
  'Take the mark back': 'Togli il segno',
  'Mark as looked at': 'Segna come guardato',
  'Next to look at: {theme}, {mode}': 'Prossimo da guardare: {theme}, {mode}',
  '{count} pairs measured in this mode, with the targets of {command}.':
    'Coppie misurate in questa modalità: {count}, con gli obiettivi di {command}.',
};
