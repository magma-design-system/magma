import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { COLOR_MODES } from '@maggioli-design-system/design-tokens/src/lib/theme-manifest.mjs';
import { applyFrame, type Scheme } from './frame.js';
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
  { id: 'ramps', label: 'Ramps' },
  { id: 'theme', label: 'Theme' },
];
const SCHEMES: ReadonlyArray<{ id: Scheme; label: string }> = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

export function PaletteSide({
  config,
  family,
  ramps,
}: {
  config: MagmaConfig;
  /** The family edited: its theme, when it backs one, is the one the frame shows. */
  family: string;
  /** The ramps of the family (or why they cannot be solved). */
  ramps: ComponentChildren;
}) {
  const [show, setShow] = useState<Show>(readShow);
  const [picked, setScheme] = useState<Scheme>('light');
  const [loaded, setLoaded] = useState(0);
  const frame = useRef<HTMLIFrameElement>(null);
  const choices = useThemeChoices();

  // solved only while the frame shows: the ramps alone need none of it
  const scene = useMemo(
    () => (show === 'theme' ? sceneStyle(config, choices) : null),
    [show, config, choices],
  );
  const theme = scene?.themes.find((one) => one.family === family) ?? scene?.themes[0] ?? undefined;
  const modes: readonly Scheme[] = theme?.modes ?? COLOR_MODES;
  const scheme: Scheme = modes.includes(picked) ? picked : modes[0];

  useEffect(() => {
    const page = frame.current?.contentDocument;
    if (!page?.documentElement || !theme) return;
    applyFrame(page, { theme: theme.name, scheme, contrast: false, css: scene?.css, modes });
  }, [theme?.name, scheme, scene, loaded]);

  const choose = (next: Show) => {
    setShow(next);
    try {
      localStorage.setItem(SHOW_KEY, next);
    } catch {
      /* storage blocked: the choice lasts until the page is left */
    }
  };

  return (
    <aside class="palette-side" data-show={show} aria-label="The family, as ramps or as a theme">
      <div class="palette-side-head" role="toolbar" aria-label="The side of the Palette">
        <mds-tab
          aria-label="Show"
          onmdsTabChange={(event: CustomEvent<{ id: number; value?: string }>) => {
            const value = event.detail?.value as Show | undefined;
            if (value) choose(value);
          }}
        >
          {SHOWS.map((one) => (
            <mds-tab-item
              type="button"
              label={one.label}
              value={one.id}
              selected={one.id === show}
            ></mds-tab-item>
          ))}
        </mds-tab>
        {show === 'theme' && (
          <mds-tab
            aria-label="Mode"
            onmdsTabChange={(event: CustomEvent<{ id: number; value?: string }>) => {
              const value = event.detail?.value as Scheme | undefined;
              if (value) setScheme(value);
            }}
          >
            {SCHEMES.map((one) => (
              <mds-tab-item
                type="button"
                label={one.label}
                value={one.id}
                selected={one.id === scheme}
                disabled={!modes.includes(one.id)}
                title={
                  modes.includes(one.id) || !theme ? undefined : `${theme.name} is ${modes[0]} only`
                }
              ></mds-tab-item>
            ))}
          </mds-tab>
        )}
      </div>
      {ramps}
      {show === 'theme' && (
        <iframe
          ref={frame}
          class="palette-side-frame"
          src="scene.html"
          title={`The theme ${theme?.name ?? ''} on a page of a product, ${scheme} mode`}
          onLoad={() => setLoaded((count) => count + 1)}
        />
      )}
    </aside>
  );
}
