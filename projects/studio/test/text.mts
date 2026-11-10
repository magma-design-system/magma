/**
 * The text a Magma component shows: its `label`, else the text it holds. The studio writes the
 * text of mds-button, mds-badge, mds-input-switch and mds-input-range in their `label`: they copy
 * the text of their slot into it once, so a text in the slot would stay in the language the
 * component loaded in (#1336, i18n.ts).
 */
export const textOf = (element: Element | null | undefined): string | undefined =>
  (element?.getAttribute('label') ?? element?.textContent ?? undefined)?.trim()
