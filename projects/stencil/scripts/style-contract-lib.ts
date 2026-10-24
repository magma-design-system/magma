/**
 * The contract of the component custom properties (#1095): which `--mds-*` a component
 * promises to the products that style it, and which belong to its implementation.
 *
 * A sheet documents its custom properties with `@prop`. The description of a promised one
 * starts with `Public.`, the description of a promised one that takes a value of its own
 * rather than a token (the colours of an animated illustration, a cover colour from a
 * catalogue record) with `Public, static.`. Any other is internal: it may change or go in
 * any release, and the products do not set it.
 *
 * Stencil keeps only the name and the description of an `@prop` in documentation.json, so
 * the mark travels in the description. component-docs.ts moves it into two fields of the
 * style entry right after the stencil build, `visibility` and `static`, and takes it out of
 * the text; what reads documentation.json after it (magma.api.txt, the shipped AGENTS.md,
 * check.usage-docs, the lint, the MCP server) reads the fields.
 *
 * Kept free of file-system side effects so scripts/style-contract-lib.spec.ts can test it.
 */

export type Visibility = 'public' | 'internal';

/** The slice of a docs-json style entry the contract reads and writes. */
export interface ContractStyle {
  name: string;
  docs?: string;
  /** Set by markStyles: whether the products may set it. */
  visibility?: Visibility;
  /** Set by markStyles on a public one that takes a value of its own, not a token. */
  static?: boolean;
}

const MARK = /^Public(, static)?\.\s*/;
/* a description that tries the mark and misses it: "public.", "Public -", "[public]" */
const NEAR_MARK = /^\W*public\b/i;

/**
 * A promised custom property. An entry without `visibility` is public: before #1095 every
 * documented custom property was promised alike.
 */
export const isPublic = (style: ContractStyle): boolean => style.visibility !== 'internal';

/**
 * The style entries of a component with the mark moved from the description into
 * `visibility` and `static`, and the descriptions that try the mark and miss it. An entry
 * that already has `visibility` is left as it is, so a second run changes nothing.
 */
export function markStyles<T extends ContractStyle>(
  styles: T[],
): { styles: (T & ContractStyle)[]; errors: string[] } {
  const errors: string[] = [];
  const marked = styles.map((style): T & ContractStyle => {
    if (style.visibility) return style;
    const docs = style.docs ?? '';
    const mark = MARK.exec(docs);
    if (!mark) {
      if (NEAR_MARK.test(docs))
        errors.push(
          `${style.name}: the description starts like the mark but is not "Public." or "Public, static."`,
        );
      return { ...style, visibility: 'internal' };
    }
    const rest = docs.slice(mark[0].length);
    if (!rest.trim()) errors.push(`${style.name}: the mark is the whole description`);
    return {
      ...style,
      docs: rest,
      visibility: 'public',
      ...(mark[1] ? { static: true } : {}),
    };
  });
  return { styles: marked, errors };
}
