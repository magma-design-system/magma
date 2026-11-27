import { useEffect, useRef, useState } from 'preact/hooks';
import { applyFrame, type Scheme } from '../frames/frame.js';
import { useT } from '../i18n/i18n.js';
import './theme-scene.css';

/*
  A theme on the page of a product (#1404): the scene (scene.html) in a frame, painted with the
  palette and the themes of the preset (scene-css.ts) as the Theme section paints it (frame.ts), in
  one mode and one contrast. The stage Themes shows the theme at its centre beside its fields, the
  full review the theme and the mode it judges (studio.object-model.md, section 4, "Prove": the scene
  of the stage and its conditions). A theme of one mode is shown in that mode only, and the caller
  says so.
*/

export function ThemeScene({
  theme,
  modes,
  css,
  scheme,
  contrast = false,
  title,
}: {
  /** The name of the theme, as `data-theme-name` writes it. */
  theme: string;
  /** The modes the theme is used in: one of them is its lock, as mds-pref-theme writes it. */
  modes: readonly Scheme[];
  /** The CSS of the preset: its palette and its themes. */
  css: string | undefined;
  scheme: Scheme;
  /** More contrast, the preference of the person (`pref-contrast-more`). */
  contrast?: boolean;
  /** The name of the frame, for assistive technologies. */
  title: string;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(0);
  const t = useT();

  useEffect(() => {
    const page = frame.current?.contentDocument;
    if (!page?.documentElement) return;
    applyFrame(page, { theme, scheme, contrast, css, modes });
  }, [theme, scheme, contrast, css, modes.join(' '), loaded]);

  return (
    <iframe
      ref={frame}
      class="theme-scene"
      src="scene.html"
      title={t(scheme === 'light' ? '{title}, light mode' : '{title}, dark mode', { title })}
      onLoad={() => setLoaded((count) => count + 1)}
    />
  );
}
