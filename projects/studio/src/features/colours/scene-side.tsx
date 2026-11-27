import type { ComponentChildren } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { COLOR_MODES } from '@maggioli-design-system/design-tokens/src/lib/theme-manifest.mjs';
import type { ColorScales, Step } from '../../engine/generator.js';
import { paintedSelector, paintsAny, type Painted } from '../../engine/paints.js';
import { applyFrame, markPainted, type Scheme } from '../../shared/frames/frame.js';
import { msg, plural, useT, type T } from '../../shared/i18n/i18n.js';
import { IT_COLOURS } from './i18n-it.js';

/*
  The side of Colours (palette-side.tsx until #1403): beside the family where the page has the
  room, the ramps of the family, or the scene, a page of a product small as a phone, painted with
  the preset at every change, so a change (a hue shifting above all) shows on real components while
  it is made (vittorio, 2026-11-06). The page is the scene of the Theme section, set as that section
  sets it (frame.ts) with the palette and the themes the Themes page exports (scene-css.ts); a
  theme of one mode is seen in that mode only. Narrower, the side is the ramps alone, in the flow
  of the page: the frame wants the room of a column of its own.

  The page shows what the family paints (paints.ts, #1308): the theme drawn from it, whose surfaces
  are the whole page, or the elements whose variant paints with it, put first in the page with what
  holds them (scene.html), in their context and at full colour (decided with vittorio, 2026-11-07,
  over the rest dimmed). A family that paints no component says so instead of a page that would not
  move.
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
export const listOf = (t: T, words: readonly string[]) =>
  words.length < 2
    ? words.join('')
    : t('{list} and {last}', { list: words.slice(0, -1).join(', '), last: words.at(-1) ?? '' });

/** A component as the line over the scene names it: mds-input-field is `input field`. */
const wordOf = (tag: string) => tag.replace(/^mds-/, '').replaceAll('-', ' ');

/** The variants the page puts first: all but the neutral ones of a theme, its whole page. */
export const placed = (painted: Painted) =>
  painted.variants.filter((one) => one.kind !== 'Neutral');

/** What the family paints, in a line over the scene: the surfaces of its theme, the elements first. */
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

/** The text of a step, legible on its own colour. */
function textColorFor(hex: string): string {
  try {
    const [r, g, b] = hex.match(/\w\w/g)!.map((c) => parseInt(c, 16) / 255);
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum > 0.45 ? '#00000099' : '#ffffff99';
  } catch {
    return '#00000099';
  }
}

/** The steps of a ramp in one mode, then its seed: data, drawn in the colours they show. */
function ScaleRow({ label, steps, seed }: { label: string; steps: Step[]; seed?: string }) {
  const t = useT(IT_COLOURS);
  return (
    <div class="scale-row">
      <span class="scale-label">{label}</span>
      <div class="scale-cells">
        {steps.map((step) => (
          <div
            class="scale-cell"
            style={{ background: step.value }}
            title={t('{value} - contrast {ratio}:1', {
              value: step.value,
              ratio: step.contrast.toFixed(2),
            })}
          >
            <span class="cell-contrast" style={{ color: textColorFor(step.value) }}>
              {step.contrast.toFixed(1)}
            </span>
            <span class="cell-hex" style={{ color: textColorFor(step.value) }}>
              {step.value.replace('#', '')}
            </span>
          </div>
        ))}
        {seed !== undefined && (
          <div
            class="scale-cell seed"
            style={{ background: seed }}
            title={t('color token: {value}', { value: seed })}
          >
            <span class="cell-hex" style={{ color: textColorFor(seed) }}>
              {t('seed')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * The ramps of the family, light and dark: the cards and the cells are data, drawn in the colours
 * they show; a preset the engine cannot solve says why in place of the ramps.
 */
export function Ramps({ scales, error }: { scales: ColorScales | null; error: string | null }) {
  const t = useT(IT_COLOURS);
  if (error) return <mds-banner variant="error">{error}</mds-banner>;
  if (!scales) return null;
  return (
    <div class="colours-ramps">
      <div class="preview-card light">
        <ScaleRow label={t('light')} steps={scales.light} seed={scales.lightColor} />
      </div>
      <div class="preview-card dark">
        <ScaleRow label={t('dark')} steps={scales.dark} seed={scales.darkColor} />
      </div>
    </div>
  );
}

/**
 * The side of the family: the ramps, or the scene. `painted` is what the family paints (paints.ts),
 * solved by the page, which shows it in its head too. Where the detail has the room of a column for
 * it (the container `family` of colours.tsx, from --container-side) the side shows its head,
 * and the scene in place of the ramps when asked; narrower, the ramps alone, in the flow.
 */
export function SceneSide({
  family,
  painted,
  scene,
  ramps,
}: {
  /** The family edited, by its full name (`status.error`). */
  family: string;
  painted: Painted | undefined;
  /** The CSS of the scene: the palette and the themes of the preset. */
  scene: string | undefined;
  ramps: ComponentChildren;
}) {
  const t = useT(IT_COLOURS);
  const [show, setShow] = useState<Show>(readShow);
  const [picked, setScheme] = useState<Scheme>('light');
  const [loaded, setLoaded] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const frame = useRef<HTMLIFrameElement>(null);
  const shownFamily = useRef<string | undefined>(undefined);

  const theme = painted?.theme;
  const paints = !painted || paintsAny(painted);
  // the neutral variants of a theme are its whole page, which has nothing to put first
  const selector = useMemo(
    () => (painted ? paintedSelector(placed(painted).map((one) => one.variant)) : ''),
    [painted],
  );
  const modes: readonly Scheme[] = theme?.modes ?? COLOR_MODES;
  const scheme: Scheme = modes.includes(picked) ? picked : modes[0];

  useEffect(() => {
    const page = frame.current?.contentDocument;
    if (show !== 'theme' || !page?.documentElement || !theme) return;
    applyFrame(page, { theme: theme.name, scheme, contrast: false, css: scene, modes });
    setTags(markPainted(page, family, selector));
    // another family starts from the head of the page, where its elements are
    if (shownFamily.current !== family) {
      shownFamily.current = family;
      page.defaultView?.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [show, theme?.name, scheme, scene, loaded, family, selector]);

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
      class="colours-side grid min-w-0 gap-between-containers"
      data-show={show}
      aria-label={t('The family, as ramps or as a theme')}
    >
      <div
        class="hidden flex-wrap items-center justify-between gap-inline @side/family:flex"
        role="toolbar"
        aria-label={t('The side of the Palette')}
      >
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
      {/* narrow, the ramps whatever was asked: the scene wants a column of its own */}
      <div class={show === 'theme' && paints ? '@side/family:hidden' : undefined}>{ramps}</div>
      {show === 'theme' && painted && paints && (
        <mds-text typography="detail" tag="p" class="hidden text-fg-muted @side/family:block">
          {paintsLine(t, family, painted, tags)}
        </mds-text>
      )}
      {show === 'theme' && paints && (
        <iframe
          ref={frame}
          class="colours-side-frame hidden @side/family:block"
          src="scene.html"
          title={t(scheme === 'light' ? '{title}, light mode' : '{title}, dark mode', {
            title: t('The theme {theme} on a page of a product', { theme: theme?.name ?? '' }),
          })}
          onLoad={() => setLoaded((count) => count + 1)}
        />
      )}
      {show === 'theme' && !paints && (
        <div class="colours-side-frame hidden p-inset @side/family:block">
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
