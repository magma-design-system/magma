/*
  The Italian of the Diffs page (diffs.tsx, #1401), by the English text it translates: the page
  hands it to the translator, which looks here before the catalogue of the studio
  (shared/i18n/i18n-it.ts). A key lives in one part only (test/i18n.test.mts).
*/
export const IT_DIFFS: Record<string, string> = {
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
};
