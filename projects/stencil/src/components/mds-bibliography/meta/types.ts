export type BibliographyFormatType =
  | 'apa' // American Psychological Association - Simmons, B. (2015, January 9). The tale of two Flaccos. Grantland. http://grantland.com/the-triangle/the-tale-of-two-flaccos/
  | 'mla' // Modern Language Association - Author's Last name, First name. "Title of Source." Title of Container, Other contributors, Version, Numbers, Publisher, Publication Date, Location.
  | 'turabian'

export type BibliographyRelationshipType =
  | 'author'
  | 'external'
