import matter from 'gray-matter';
import { marked } from 'marked';
import type { Deck, DeckConfig, LayoutName, Slide, SlideConfig } from '../model/types.js';
import { LAYOUT_NAMES } from '../model/types.js';

/** A line consisting only of `---` (optionally surrounded by whitespace). */
const SEPARATOR = /^\s*---\s*$/;

marked.setOptions({
  gfm: true,
  breaks: false,
});

/**
 * Parse a Markdown + frontmatter document into a {@link Deck}.
 *
 * Source format (see SPEC.md):
 *  - The leading `---...---` block is the deck-wide frontmatter.
 *  - Slides are separated by a line containing exactly `---`.
 *  - A slide may open with its own `---...---` frontmatter block.
 */
export function parseDeck(source: string): Deck {
  const normalized = source.replace(/\r\n?/g, '\n');
  const { data, content } = matter(normalized);
  const config = data as DeckConfig;

  const blocks = splitBlocks(content);
  const slides = assembleSlides(blocks, config);
  resolveSections(slides, config);

  return { config, slides };
}

/**
 * Resolve the sticky footer section: a slide that sets `section` (directly or
 * via a `footer` override) changes the current section, which then carries
 * forward to later slides until the next change.
 */
function resolveSections(slides: Slide[], deck: DeckConfig): void {
  let current = deck.footer?.section;
  for (const slide of slides) {
    const footer = slide.config.footer;
    const explicit =
      slide.config.section ?? (footer && typeof footer === 'object' ? footer.section : undefined);
    if (explicit !== undefined) current = explicit;
    slide.section = current;
  }
}

/** Split the body into blocks on separator lines, dropping empty edges. */
function splitBlocks(body: string): string[] {
  const blocks: string[] = [];
  let current: string[] = [];
  for (const line of body.split('\n')) {
    if (SEPARATOR.test(line)) {
      blocks.push(current.join('\n'));
      current = [];
    } else {
      current.push(line);
    }
  }
  blocks.push(current.join('\n'));
  return blocks;
}

/**
 * Walk the blocks left to right. A block that parses as a non-empty YAML
 * mapping is treated as the frontmatter of the slide that follows it;
 * every other non-empty block starts a slide.
 */
function assembleSlides(blocks: string[], deck: DeckConfig): Slide[] {
  const slides: Slide[] = [];
  let pending: SlideConfig | null = null;

  for (const block of blocks) {
    const fm = readFrontmatter(block);
    if (fm) {
      // A frontmatter block following another (with only blank lines between)
      // means the previous slide has no body: flush it as an empty slide.
      if (pending !== null) {
        slides.push(buildSlide(slides.length, pending, '', deck));
      }
      pending = fm;
      continue;
    }
    if (block.trim() === '') {
      // Blank block between a slide's frontmatter and its content: keep pending.
      continue;
    }
    slides.push(buildSlide(slides.length, pending ?? {}, block, deck));
    pending = null;
  }

  // A trailing frontmatter-only block (no content) yields an empty slide so the
  // author still sees their intent rather than silent loss.
  if (pending !== null) {
    slides.push(buildSlide(slides.length, pending, '', deck));
  }

  return slides;
}

/**
 * Return the parsed mapping if `block` looks like a frontmatter block, else
 * null. Reuses gray-matter's YAML engine by wrapping the block in fences.
 */
function readFrontmatter(block: string): SlideConfig | null {
  if (block.trim() === '') return null;
  try {
    const { data } = matter(`---\n${block}\n---\n`);
    if (data && typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length > 0) {
      return data as SlideConfig;
    }
  } catch {
    // Not valid YAML: treat as content.
  }
  return null;
}

function buildSlide(index: number, config: SlideConfig, markdown: string, deck: DeckConfig): Slide {
  const layout = resolveLayout(config.layout, deck.layout, index);
  const body = markdown.replace(/^\n+|\n+$/g, '');
  return {
    index,
    layout,
    config,
    markdown: body,
    html: marked.parse(body) as string,
  };
}

/** Resolve the layout for a slide: slide > deck default > heuristic default. */
function resolveLayout(
  slide: LayoutName | undefined,
  deckDefault: LayoutName | undefined,
  index: number,
): LayoutName {
  if (slide && LAYOUT_NAMES.includes(slide)) return slide;
  if (deckDefault && LAYOUT_NAMES.includes(deckDefault)) return deckDefault;
  // The first slide reads as a cover unless told otherwise.
  return index === 0 ? 'title' : 'content';
}
