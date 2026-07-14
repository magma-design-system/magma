/**
 * Data model for a Magma slide deck.
 *
 * A deck is authored as a single Markdown file: a leading frontmatter block
 * holds deck-wide configuration, and the body is split into slides. Each slide
 * may carry its own frontmatter block. See SPEC.md for the source format.
 */

/** Built-in slide layouts shipped in this first increment. */
export type LayoutName =
  | 'title'
  | 'section'
  | 'content'
  | 'two-column'
  | 'quote'
  | 'image-full'
  | 'code';

/** The seven built-in layout names, for validation and iteration. */
export const LAYOUT_NAMES: readonly LayoutName[] = [
  'title',
  'section',
  'content',
  'two-column',
  'quote',
  'image-full',
  'code',
] as const;

/**
 * The persistent footer shown on every slide. Deck-level values are the
 * defaults; a slide may override any field (see {@link SlideConfig.footer}), and
 * `section` is sticky - it carries forward until a later slide changes it.
 */
export interface FooterConfig {
  /** Company logo (URL/path); embedded when local. */
  logo?: string;
  /** Group/department presenting (bold, left). */
  group?: string;
  /** Longer description under the group (left). */
  groupDetail?: string;
  /** Deck subject (bold, right). */
  subject?: string;
  /** Current section/chapter (right). Sticky across slides. */
  section?: string;
  /** Show the automatic page number. Defaults to true when a footer exists. */
  pageNumbers?: boolean;
}

/** Deck-wide configuration, taken from the leading frontmatter block. */
export interface DeckConfig {
  /** Deck title (used for the HTML document title and the title layout). */
  title?: string;
  /** Author name, surfaced by the title layout. */
  author?: string;
  /** Built-in theme name. Defaults to `maggioli`. */
  theme?: string;
  /** Default layout applied to slides that do not set their own. */
  layout?: LayoutName;
  /**
   * Per-deck overrides of `--mds-slide-*` custom properties. Injected as the
   * highest-precedence layer of the theming cascade (level 3).
   */
  tokens?: Record<string, string>;
  /** Persistent footer defaults for the whole deck. */
  footer?: FooterConfig;
}

/** Per-slide configuration, taken from an optional per-slide frontmatter block. */
export interface SlideConfig {
  /** Layout for this slide. Falls back to the deck default, then `content`. */
  layout?: LayoutName;
  /** Slide title/heading, used by layouts that render a heading region. */
  title?: string;
  /** Image URL/path, used by `image-full` and `two-column` layouts. */
  image?: string;
  /** Language hint for the `code` layout (e.g. `ts`, `bash`). */
  lang?: string;
  /** Current section/chapter for the footer. Sticky: carries forward. */
  section?: string;
  /** Per-slide footer override: `false` hides it, or an object overrides fields. */
  footer?: boolean | Partial<FooterConfig>;
  /** Additional layout-specific fields are preserved verbatim. */
  [key: string]: unknown;
}

/** A single parsed slide. */
export interface Slide {
  /** Zero-based position within the deck. */
  index: number;
  /** Resolved layout for this slide. */
  layout: LayoutName;
  /** Per-slide configuration. */
  config: SlideConfig;
  /** Raw Markdown body of the slide (frontmatter stripped). */
  markdown: string;
  /** Rendered HTML of the slide body. */
  html: string;
  /** Resolved sticky section for this slide's footer. */
  section?: string;
}

/** A fully parsed deck. */
export interface Deck {
  config: DeckConfig;
  slides: Slide[];
}
