/*
 * The order of dictionary.json, shared by the validator and the insertion helper.
 *
 * The file is sorted by comparing each key *with its quotes*, as an editor's
 * "sort lines ascending" does on the raw lines. Unicode collation ranks
 * punctuation `_` < `-` < `"`, so a key sorts after every key that extends it:
 *
 *   "heart-outline"   ('-' ...)
 *   "heart"           ('"' closes the shorter key, and sorts after '-')
 *
 * Comparing the bare keys would put "heart" first and flag ~200 entries as out
 * of place, all of them variants listed before their base.
 *
 * The collator is pinned to 'en' so the order does not depend on the locale of
 * the machine running it; 'it' and the root collation agree on it.
 */

const collator = new Intl.Collator('en');

const compareKeys = (a: string, b: string): number => collator.compare(`"${a}"`, `"${b}"`);

export { compareKeys };
