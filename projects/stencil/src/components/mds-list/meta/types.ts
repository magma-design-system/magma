// the marker of the items of mds-list: a glyph before a text (dot), or nothing, for items that
// are links, cards or chips laid out by the page (none, #1408)
export const listMarkerDictionary = ['dot', 'none'] as const;

export type ListMarkerType = (typeof listMarkerDictionary)[number];
