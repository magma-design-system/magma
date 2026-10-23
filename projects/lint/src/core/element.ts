/*
  An element as the rules see it, whatever the template it was written in: its tag, its
  attributes with how they reach it, its classes and whether it has content for the default
  slot. Each parser has an adapter that builds one (../eslint/adapters.ts), so a rule is
  written once for HTML, JSX and Angular templates.
*/

export interface LintAttribute {
  /** As written: an attribute (`icon`, `aria-label`) or a property (`ariaLabel`, `label`). */
  name: string;
  /**
   * How it reaches the element: `static`, an attribute in the markup (`tone="weak"`);
   * `property`, a property binding (`<MdsButton disabled={x}>`, Angular `[disabled]`);
   * `attribute`, an attribute binding (Angular `[attr.disabled]`).
   */
  binding: 'static' | 'property' | 'attribute';
  /**
   * The value when the source states it: a string, a number, a boolean or null (a literal
   * expression, `{false}`, `[attr.x]="null"`); `''` for an attribute without value;
   * undefined for an expression only known at run time.
   */
  value: string | number | boolean | null | undefined;
  /** What to report on. */
  node: unknown;
}

export interface LintClass {
  /** One class, as written (`dark:bg-white/50`). */
  name: string;
  /** What to report on: the attribute that holds it. */
  node: unknown;
}

export interface LintElement {
  /** The custom element tag: `mds-button` for `<mds-button>` and `<MdsButton>`. */
  tag: string;
  attributes: LintAttribute[];
  classes: LintClass[];
  /** It has, or may have, content for the default slot: text, an element, an expression. */
  content: boolean;
  /** It spreads attributes the template does not show (`{...props}`): nothing is sure. */
  spread: boolean;
  node: unknown;
}

export interface Finding {
  node: unknown;
  message: string;
}

/** `MdsButtonDropdown` -> `mds-button-dropdown`; a lowercase tag stays as it is. */
export const tagOf = (name: string): string =>
  /^[A-Z]/.test(name)
    ? name.replace(
        /[A-Z]/g,
        (letter, index: number) => `${index ? '-' : ''}${letter.toLowerCase()}`,
      )
    : name;

/** The attribute or property of the element that answers to any of `names`. */
export const attributeOf = (element: LintElement, ...names: string[]): LintAttribute | undefined =>
  element.attributes.find((attribute) => names.includes(attribute.name));

/** The attribute gives a value: a non-empty literal, or an expression. */
export const isSet = (attribute: LintAttribute | undefined): boolean =>
  attribute !== undefined &&
  attribute.value !== false &&
  attribute.value !== null &&
  !(typeof attribute.value === 'string' && attribute.value.trim() === '');
