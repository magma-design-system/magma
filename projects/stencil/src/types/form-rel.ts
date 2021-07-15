export type FormRelType =
  | 'external' // Specifies that the referenced document is not a part of the current site
  | 'help' // Links to a help document
  | 'license' // Links to copyright information for the document
  | 'next' // The next document in a selection
  | 'nofollow' // Links to an unendorsed document, like a paid link. ("nofollow" is used by Google, to specify that the Google search spider should not follow that link)
  | 'noopener'
  | 'noreferrer' // Specifies that the browser should not send a HTTP referrer header if the user follows the hyperlink
  | 'opener'
  | 'prev' // The previous document in a selection
  | 'search' // Links to a search tool for the document
