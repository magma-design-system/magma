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

/** Color scheme of a deck. Independent of the theme: any theme renders in both. */
export type Scheme = 'light' | 'dark';

/** The two schemes, for validation and iteration. */
export const SCHEMES: readonly Scheme[] = ['light', 'dark'] as const;

/** The two chrome zones a theme can lay out around the slide content. */
export type ZoneName = 'header' | 'footer';

/** The two zones, for iteration. */
export const ZONE_NAMES: readonly ZoneName[] = ['header', 'footer'] as const;

/**
 * The elements a theme can place in a zone. The deck supplies their content
 * ({@link ChromeContent}); the theme decides where each one goes
 * ({@link ThemeManifest}). `page` is the automatic page number.
 */
export type ChromeElement = 'logo' | 'group' | 'groupDetail' | 'subject' | 'section' | 'page';

/** The chrome elements, for validation and iteration. */
export const CHROME_ELEMENTS: readonly ChromeElement[] = [
  'logo',
  'group',
  'groupDetail',
  'subject',
  'section',
  'page',
] as const;

/** One slot entry: a single element, or several stacked vertically. */
export type ChromeItem = ChromeElement | ChromeElement[];

/** Where a theme places elements inside one zone. */
export interface ZonePlacement {
  /** Items aligned to the start (left) edge, in order. */
  start?: ChromeItem[];
  /** Items aligned to the end (right) edge, in order. */
  end?: ChromeItem[];
}

/** Per-layout zone defaults: `false` hides the zone on that layout. */
export type ZoneToggles = Partial<Record<ZoneName, boolean>>;

/**
 * A slide theme, read from `themes/<name>/theme.json`. It owns the placement of
 * the chrome, so decks stay on-brand whatever content they supply. The color,
 * shape and scheme axes are Magma's, not the theme's (see SPEC.md).
 */
export interface ThemeManifest {
  /** Default logo, relative to the theme folder. A deck `logo` wins. */
  logo?: string;
  /** Placement of the header zone. A zone the theme does not place never renders. */
  header?: ZonePlacement;
  /** Placement of the footer zone. */
  footer?: ZonePlacement;
  /** Layouts that hide a zone by default (a slide can still force it). */
  layouts?: Partial<Record<LayoutName, ZoneToggles>>;
}

/**
 * Content for the chrome elements. Set on the deck as defaults; a slide may
 * override any field. `section` is sticky - it carries forward until a later
 * slide changes it.
 */
export interface ChromeContent {
  /** Company logo (URL/path); embedded when local. Falls back to the theme logo. */
  logo?: string;
  /** Group/department presenting. */
  group?: string;
  /** Longer description of the group. */
  groupDetail?: string;
  /** Deck subject. */
  subject?: string;
  /** Current section/chapter. Sticky across slides. */
  section?: string;
  /** Show the automatic page number wherever the theme places it. Default true. */
  pageNumbers?: boolean;
}

/** Deck-wide configuration, taken from the leading frontmatter block. */
export interface DeckConfig extends ChromeContent {
  /** Deck title (used for the HTML document title and the title layout). */
  title?: string;
  /** Author name, surfaced by the title layout. */
  author?: string;
  /** Slide theme (a folder under theme/themes/, named as a Magma theme). Default `business`. */
  theme?: string;
  /** Color scheme. Default `light`. */
  scheme?: Scheme;
  /** Default layout applied to slides that do not set their own. */
  layout?: LayoutName;
  /**
   * Per-deck overrides of `--mds-slide-*` custom properties. Injected as the
   * highest-precedence layer of the theming cascade (level 3).
   */
  tokens?: Record<string, string>;
  /** Show the header zone on every slide. Default false. */
  header?: boolean;
  /** Show the footer zone on every slide. Default false. */
  footer?: boolean;
}

/** Per-slide configuration, taken from an optional per-slide frontmatter block. */
export interface SlideConfig extends ChromeContent {
  /** Layout for this slide. Falls back to the deck default, then `content`. */
  layout?: LayoutName;
  /** Slide title/heading, used by layouts that render a heading region. */
  title?: string;
  /** Image URL/path, used by `image-full` and `two-column` layouts. */
  image?: string;
  /** Language hint for the `code` layout (e.g. `ts`, `bash`). */
  lang?: string;
  /** Force the header on (`true`) or off (`false`) for this slide. */
  header?: boolean;
  /** Force the footer on (`true`) or off (`false`) for this slide. */
  footer?: boolean;
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
  /** Resolved sticky section for this slide's chrome. */
  section?: string;
}

/** A fully parsed deck. */
export interface Deck {
  config: DeckConfig;
  slides: Slide[];
}
