import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { COLOR_MODES } from '@maggioli-design-system/design-tokens/src/lib/theme-manifest.mjs';
import { applyFrame, markPainted, type Scheme } from './frame.js';
import { msg, plural, useT, type T } from './i18n.js';
import { paintedBy, paintedSelector, paintsAny, type Painted } from './paints.js';
import { sceneStyle } from './scene-css.js';
import { useThemeChoices } from './theme-choices.js';

/*
  The side of the Palette, beside the family and the global settings where the detail has the
  room (palette.css): the ramps of the family, or the theme on a page of a product, small as a
  phone, painted with the configuration at every change, so a change (a hue shifting above all)
  shows on real components while it is made (vittorio, 2026-11-06). The page is the scene of the
  Theme section, set as that section sets it (frame.ts) with the palette and the themes the Themes
  page exports (scene-css.ts); a theme of one mode is seen in that mode only. Narrower, the side
  is the ramps alone, in the flow of the page: the frame wants the room of a column of its own.

  The page shows what the family paints (paints.ts, #1308): the theme drawn from it, whose
  surfaces are the whole page, or the elements whose variant paints with it, put first in the
  page with what holds them (scene.html), in their context and at full colour (decided with
  vittorio, 2026-11-07, over the rest dimmed). A family that paints no component says so instead
  of a page that would not move.
*/

type Show = 'ramps' | 'theme';

/** What the side shows, remembered for the person who looks (a convenience, not their work). */
const SHOW_KEY = 'magma-studio:palette-side';
const readShow = (): Show => {
  try {
    return localStorage.getItem(SHOW_KEY) === 'theme' ? 'theme' : 'ramps';
  } catch {
    return 'ramps';
  }
};

const SHOWS: ReadonlyArray<{ id: Show; label: string }> = [
  { id: 'ramps', label: msg('Ramps') },
  { id: 'theme', label: msg('Theme') },
];
const SCHEMES: ReadonlyArray<{ id: Scheme; label: string }> = [
  { id: 'light', label: msg('Light') },
  { id: 'dark', label: msg('Dark') },
];

/** The words of a list: `a, b and c`. */
const listOf = (t: T, words: readonly string[]) =>
  words.length < 2
    ? words.join('')
    : t('{list} and {last}', { list: words.slice(0, -1).join(', '), last: words.at(-1) ?? '' });

/** A component as the line under the head names it: mds-input-field is `input field`. */
const wordOf = (tag: string) => tag.replace(/^mds-/, '').replaceAll('-', ' ');

/** The variants the page puts first: all but the neutral ones of a theme, its whole page. */
const placed = (painted: Painted) => painted.variants.filter((one) => one.kind !== 'Neutral');

/** What the family paints, in a line: the surfaces of its theme, the elements first in the page. */
export function paintsLine(t: T, family: string, painted: Painted, tags: readonly string[]) {
  const name = family.split('.')[1] ?? family;
  const variants = [...new Set(placed(painted).map((one) => one.variant))];
  const through = [
    ...new Set(
      placed(painted)
        .map((one) => one.through)
        .filter((one) => one !== family),
    ),
  ];
  const parts: string[] = [];
  if (painted.surfaces)
    parts.push(
      t('{name} is the family of the theme {theme}, whose surfaces are the whole page', {
        name,
        theme: painted.theme?.name ?? '',
      }),
    );
  if (variants.length) {
    const seen = [...new Set(tags)].map(wordOf);
    const list = { name, variants: listOf(t, variants) };
    const paints = [
      painted.surfaces
        ? plural(
            t,
            variants.length,
            'it paints the variant {variants}',
            'it paints the variants {variants}',
            list,
          )
        : plural(
            t,
            variants.length,
            '{name} paints the variant {variants}',
            '{name} paints the variants {variants}',
            list,
          ),
      ...(through.length ? [t('through {families}', { families: listOf(t, through) })] : []),
    ].join(' ');
    parts.push(
      seen.length
        ? t('{paints}, first in the page: {elements}', { paints, elements: listOf(t, seen) })
        : t('{paints}, which no element of the page takes', { paints }),
    );
  }
  return `${parts.join('; ')}.`;
}

export function PaletteSide({
  config,
  family,
  ramps,
}: {
  config: MagmaConfig;
  /** The family edited, by its full name (`status.error`): the page shows what it paints. */
  family: string;
  /** The ramps of the family (or why they cannot be solved). */
  ramps: ComponentChildren;
}) {
  const t = useT();
  const [show, setShow] = useState<Show>(readShow);
  const [picked, setScheme] = useState<Scheme>('light');
  const [loaded, setLoaded] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const frame = useRef<HTMLIFrameElement>(null);
  const shownFamily = useRef<string | undefined>(undefined);
  const choices = useThemeChoices();

  // solved only while the frame shows: the ramps alone need none of it
  const scene = useMemo(
    () => (show === 'theme' ? sceneStyle(config, choices) : null),
    [show, config, choices],
  );
  const painted = useMemo(
    () => (scene ? paintedBy(family, { config, themes: scene.themes, choices }) : undefined),
    [scene, family],
  );
  const theme = painted?.theme;
  const paints = !painted || paintsAny(painted);
  // the neutral variants of a theme are its whole page, which has nothing to put first
  const selector = painted ? paintedSelector(placed(painted).map((one) => one.variant)) : '';
  const modes: readonly Scheme[] = theme?.modes ?? COLOR_MODES;
  const scheme: Scheme = modes.includes(picked) ? picked : modes[0];

  useEffect(() => {
    const page = frame.current?.contentDocument;
    if (!page?.documentElement || !theme) return;
    applyFrame(page, { theme: theme.name, scheme, contrast: false, css: scene?.css, modes });
    setTags(markPainted(page, family, selector));
    // another family starts from the head of the page, where its elements are
    if (shownFamily.current !== family) {
      shownFamily.current = family;
      page.defaultView?.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [theme?.name, scheme, scene, loaded, family, selector]);

  const choose = (next: Show) => {
    setShow(next);
    try {
      localStorage.setItem(SHOW_KEY, next);
    } catch {
      /* storage blocked: the choice lasts until the page is left */
    }
  };

  return (
    <aside
      class="palette-side"
      data-show={show}
      aria-label={t('The family, as ramps or as a theme')}
    >
      <div class="palette-side-head" role="toolbar" aria-label={t('The side of the Palette')}>
        <mds-tab
          aria-label={t('Show')}
          onmdsTabChange={(event: CustomEvent<{ id: number; value?: string }>) => {
            const value = event.detail?.value as Show | undefined;
            if (value) choose(value);
          }}
        >
          {SHOWS.map((one) => (
            <mds-tab-item
              type="button"
              label={t(one.label)}
              value={one.id}
              selected={one.id === show}
            ></mds-tab-item>
          ))}
        </mds-tab>
        {show === 'theme' && paints && (
          <mds-tab
            aria-label={t('Mode')}
            onmdsTabChange={(event: CustomEvent<{ id: number; value?: string }>) => {
              const value = event.detail?.value as Scheme | undefined;
              if (value) setScheme(value);
            }}
          >
            {SCHEMES.map((one) => (
              <mds-tab-item
                type="button"
                label={t(one.label)}
                value={one.id}
                selected={one.id === scheme}
                disabled={!modes.includes(one.id)}
                title={
                  modes.includes(one.id) || !theme
                    ? undefined
                    : modes[0] === 'light'
                      ? t('{theme} is light only', { theme: theme.name })
                      : t('{theme} is dark only', { theme: theme.name })
                }
              ></mds-tab-item>
            ))}
          </mds-tab>
        )}
      </div>
      {ramps}
      {show === 'theme' && painted && paints && (
        <mds-text typography="detail" tag="p" class="palette-side-note">
          {paintsLine(t, family, painted, tags)}
        </mds-text>
      )}
      {show === 'theme' && paints && (
        <iframe
          ref={frame}
          class="palette-side-frame"
          src="scene.html"
          title={t(scheme === 'light' ? '{title}, light mode' : '{title}, dark mode', {
            title: t('The theme {theme} on a page of a product', { theme: theme?.name ?? '' }),
          })}
          onLoad={() => setLoaded((count) => count + 1)}
        />
      )}
      {show === 'theme' && !paints && (
        <div class="palette-side-none">
          <mds-text typography="detail" tag="p">
            {t(
              '{name} paints no component of Magma: no variant of a component takes it, no theme points an accent at it and no theme is drawn from it.',
              { name: family },
            )}
          </mds-text>
        </div>
      )}
    </aside>
  );
}
