/*
  The Italian of the stage Colours (colours.tsx and the pieces beside it, #1403), by the English
  text it translates: the page hands it to the translator, which looks here before the catalogue of
  the studio (shared/i18n/i18n-it.ts, and its Palette part for the fields of a family that Groups
  writes too). A key lives in one part only (test/i18n.test.mts).
*/
export const IT_COLOURS: Record<string, string> = {
  'Adjust a colour of the preset and see what it paints.':
    'Regola un colore del preset e guarda cosa dipinge.',
  'New group': 'Nuovo gruppo',
  'The group {group}, in Groups': 'Il gruppo {group}, in Gruppi',
  'The families of the preset': 'Le famiglie del preset',
  // where a value the family does not set comes from (object model, "Valore ereditato", option A)
  'Inherits from the group {group}': 'Eredita dal gruppo {group}',
  'Inherits from the {preset}': 'Eredita dal {preset}',
  preset: 'preset',
  // the contrast scale of the family, with its badge
  'Open the scale {scale}': 'Apri la scala {scale}',
  'The roles of Magma name {steps} steps by number: on {count} steps they do not hold. A family that paints Magma takes a scale of {steps} steps.':
    'I ruoli di Magma nominano {steps} gradini per numero: su {count} gradini non reggono. Una famiglia che dipinge Magma prende una scala di {steps} gradini.',
  '{name} ({count} steps, for the cases outside Magma)':
    '{name} ({count} gradini, per i casi fuori da Magma)',
  // what the family paints, and the themes that use it
  'Tint of the theme {theme}': 'Tinta del tema {theme}',
  'Accent of the theme {theme}': 'Accento del tema {theme}',
  'AI accent of the theme {theme}': 'Accento AI del tema {theme}',
  'It paints the variant {variants}': 'Dipinge la variante {variants}',
  'It paints the variants {variants}': 'Dipinge le varianti {variants}',
  'It paints nothing of Magma: a case outside Magma, which goes out as tokens alone.':
    'Non dipinge nulla di Magma: è un caso fuori da Magma, che esce solo nei token.',
  // a group born with its first family
  'Name of the group': 'Nome del gruppo',
};
