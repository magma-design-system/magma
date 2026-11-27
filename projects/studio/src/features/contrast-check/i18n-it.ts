/*
  The Italian of the Contrast check page and of the dialog of an export while the gate fails
  (contrast-check.tsx, gate-dialog.tsx, #1401), by the English text it translates: the page hands
  it to the translator, which looks here before the catalogue of the studio
  (shared/i18n/i18n-it.ts). A key lives in one part only (test/i18n.test.mts).
*/
export const IT_CONTRAST_CHECK: Record<string, string> = {
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
};
