/** The pages of a book when nothing says how many: a manual about 2.5 cm deep. */
const defaultPages = 300;

/** The pages a book is drawn with: past them, a wrong value would draw a sheet or a brick. */
const pageRange = { max: 3000, min: 4 };

/** Rigid boards, in centimetres: about 2.5 mm thick, overhanging the pages by about 3 mm. */
const hardcoverBoards = { square: 0.3, thickness: 0.25 };

/** Whether the value is a number of pages: a positive number, or no value at all. */
const isPageCount = (pages?: number | null): boolean =>
  pages == null || (Number.isFinite(pages) && pages > 0);

/** The pages the book is drawn with: the value, whole and within range, or the default. */
const pageCount = (pages?: number | null): number =>
  pages != null && Number.isFinite(pages) && pages > 0
    ? Math.max(pageRange.min, Math.min(pageRange.max, Math.round(pages)))
    : defaultPages;

/**
 * The boards of a hardcover, as shares of the width of the book (`width`, in centimetres),
 * which is what the stylesheet draws them in: their thickness and how far they overhang the
 * pages. A paperback has none. The depth of the pages is the stylesheet's, from the number of
 * pages and the thickness of a page (--mds-book-page-weight-min and -max).
 */
const boardVolume = (width: number, hardcover: boolean): { board: number; square: number } => ({
  board: hardcover ? hardcoverBoards.thickness / width : 0,
  square: hardcover ? hardcoverBoards.square / width : 0,
});

export { boardVolume, defaultPages, isPageCount, pageCount, pageRange };
