import { useEffect, useRef, useState } from 'preact/hooks';
import { semantic } from '@maggioli-design-system/design-tokens/semantic.config';
import { COLOR_MODES } from '@maggioli-design-system/design-tokens/src/lib/theme-manifest.mjs';
import { useStudio } from './state/studio.js';
import { applyFrame, type Scheme } from './shared/frames/frame.js';
import { msg, useT, type T } from './shared/i18n/i18n.js';
import {
  applyPrefs,
  DEFAULT_PREFS,
  Modes,
  PREFS_TITLE,
  ScenePrefsPanel,
  type Choice,
  type ContrastMode,
  type ScenePrefs,
} from './scene-prefs.js';
import type { ModeView } from './shared/routes/routes.js';

/*
  The Theme section (#695; out of shell.tsx in #1402, when the shell moved into app/): the theme
  on a scene of a product, its axes and the ruler of the preview. A page not moved into features/
  yet: the axes become stages after the Exceptions (studio.object-model.md, section 5).
*/

/** The axes of a theme the bar of the Theme section opens, in the order of #696. */
const AXES = [
  { id: 'typography', label: msg('Typography'), icon: 'mi/baseline/format-size' },
  { id: 'shape', label: msg('Shape'), icon: 'mi/baseline/rounded-corner' },
  { id: 'density', label: msg('Density'), icon: 'mi/baseline/density-medium' },
  { id: 'depth', label: msg('Depth'), icon: 'mi/baseline/layers' },
  { id: 'preferences', label: msg('Preferences of the person'), icon: 'mi/baseline/accessibility' },
  { id: 'dimension', label: msg('Dimension'), icon: 'mi/baseline/straighten' },
] as const;
type Axis = (typeof AXES)[number]['id'];
/**
 * The axes with a panel today, the only ones the bar shows: an axis with nothing to set is no
 * control. The others come back with their panel (#696); shape (`data-corner-shape`) and depth
 * (`--depth`) are already in Magma, typography, density and dimension not yet.
 */
const READY: ReadonlySet<Axis> = new Set(['preferences']);
/** The button of an axis, the caller its dropdown opens from. */
const axisId = (axis: Axis): string => `studio-axis-${axis}`;
/** The button of the preview, after the axes: a ruler (vittorio, 2026-11-06). */
const PREVIEW_ID = 'studio-preview';
/** A dropdown of the bar: the one of an axis, or the one of the preview. */
type Panel = Axis | 'preview';

/**
 * The themes the studio previews: the ones Magma ships, without the names kept until the next
 * major (semantic.config.ts, `deprecated`).
 */
export const PREVIEW_THEMES = Object.entries(semantic.themes)
  .filter(([, def]) => typeof def === 'string' || !def.deprecated)
  .map(([name]) => name);

const titleOf = (name: string): string => name.charAt(0).toUpperCase() + name.slice(1);

/*
  What the author checks the theme UNDER, apart from what they edit (#697, "The right column"),
  opens from the bar at the bottom too, beside the theme and its axes, so the frame takes the
  whole section (vittorio, 2026-11-06): the mode and the contrast with the preferences of the
  person, the view and the width of the frame in the dropdown of the preview. The mode and the
  contrast are not exported: they are the preferences of the person.
*/

/**
 * The views of the same theme (#697), each a page of its own in the frame: Scenes, compositions
 * that look like a product, where a theme is judged as a whole; Groups, the components by their
 * role in the composition (container, control, marker), at every variant, tone and state.
 */
const VIEWS = [
  {
    id: 'scenes',
    label: msg('Scenes'),
    page: 'scene.html',
    title: msg('The theme on a page of a product'),
  },
  {
    id: 'groups',
    label: msg('Groups'),
    page: 'groups.html',
    title: msg('The theme on every component'),
  },
] as const;
type View = (typeof VIEWS)[number]['id'];

/**
 * The widths of the frame: the room of the section, or a breakpoint of Magma (tokens/screen,
 * docs/TOKENS.md), the widths its layouts change at, so the frame shows the layout from that
 * breakpoint up. style.css sizes the frame with `--breakpoint-<id>`; the word of a width reads the
 * same property, so it never names a width the frame does not have.
 */
type Width = 'full' | 'desktop' | 'tablet' | 'mobile';
const WIDTHS: ReadonlyArray<Choice<Width>> = [
  { mode: 'full', word: 'full', icon: 'mi/baseline/width-full' },
  { mode: 'desktop', word: 'desktop', icon: 'mi/baseline/desktop-windows' },
  { mode: 'tablet', word: 'tablet', icon: 'mi/baseline/tablet-mac' },
  { mode: 'mobile', word: 'mobile', icon: 'mi/baseline/smartphone' },
];
/** The name of each breakpoint the frame takes. */
const WIDTH_NAMES: Record<Exclude<Width, 'full'>, string> = {
  desktop: msg('Desktop'),
  tablet: msg('Tablet'),
  mobile: msg('Mobile'),
};
const widthLabel = (t: T, width: Width): string => {
  if (width === 'full') return t('Full width');
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(`--breakpoint-${width}`)
    .trim();
  const name = t(WIDTH_NAMES[width]);
  return value ? `${name} (${value})` : name;
};
/** The words of the choice of the width (`Modes`): its name, and each width. */
const widthWords = (t: T): Record<string, string> => ({
  label: t('Width'),
  ...Object.fromEntries(WIDTHS.map(({ mode }) => [mode, widthLabel(t, mode)])),
});

/** The id of the title of the panel of the preview, which names the dropdown that holds it. */
const PREVIEW_TITLE = 'studio-preview-title';

/**
 * The panel of the preview, behind the ruler of the bar: the view the frame shows, the page it
 * opens beside the name of the choice, then the width of the frame, drawn as the panel of the
 * preferences draws its choices (scene-prefs.tsx).
 */
function PreviewPanel({
  view,
  onView,
  width,
  onWidth,
}: {
  view: View;
  onView: (view: View) => void;
  width: Width;
  onWidth: (width: Width) => void;
}) {
  const page = VIEWS.find((one) => one.id === view)!;
  const t = useT();
  return (
    <div class="studio-panel">
      <mds-text id={PREVIEW_TITLE} typography="h6" tag="h2">
        {t('Preview')}
      </mds-text>
      <mds-separator></mds-separator>
      <div class="studio-choice">
        <mds-text typography="caption" tag="p">
          <b>{t('View')}</b> {t(page.title)}
        </mds-text>
        <mds-tab
          fill
          aria-label={t('View')}
          onmdsTabChange={(event: CustomEvent<{ id: number; value?: string }>) => {
            const value = event.detail?.value as View | undefined;
            if (value) onView(value);
          }}
        >
          {VIEWS.map((one) => (
            <mds-tab-item
              type="button"
              label={t(one.label)}
              value={one.id}
              selected={one.id === view}
            ></mds-tab-item>
          ))}
        </mds-tab>
      </div>
      <Modes words={widthWords(t)} choices={WIDTHS} value={width} onValue={onWidth} />
    </div>
  );
}

/**
 * The Theme section: the theme on a scene of a product in an iframe, the whole section, and the
 * bar at the bottom: the theme, its axes, the preview. The scene is a document of its own: what is
 * set on its <html> and on its own preferences moves it and leaves the studio alone (#695, "The
 * dogfooding constraint"). Both modes are two frames side by side, scrolled together; an axis, and
 * the preview, open their controls in a dropdown from their button, and the choices of the
 * preferences reach every frame (scene-prefs.tsx). The select offers the
 * themes of the configuration the person edits, which the frame paints (scene-css.ts); while the
 * generator refuses the configuration, the themes Magma ships. The theme and the mode are those of
 * the address (a link of the Themes page, shared/routes/routes.ts), the first theme in light when it names
 * none: a choice made here writes its address in place, and back, forward or a link typed choose
 * again. One source, so the echo of an address written here never undoes a choice made after it.
 */
export function ThemePage({
  theme: askedTheme,
  mode: askedMode,
  onChoose,
}: {
  /** The theme the address names. */
  theme?: string;
  /** The mode the address names. */
  mode?: ModeView;
  /** A theme or a mode chosen here: the router writes its address in place. */
  onChoose: (theme: string, mode: ModeView) => void;
}) {
  const frames = useRef<Array<HTMLIFrameElement | null>>([]);
  const select = useRef<HTMLMdsInputSelectElement>(null);
  const t = useT();
  // the palette and the themes of the work, the choices of the Themes page (names, accents,
  // modes) in them: a computed of the state, which the frame paints
  const scene = useStudio().scene.value;
  const names = scene?.themes.map((one) => one.name) ?? PREVIEW_THEMES;
  // the theme asked for is kept while the configuration loads: a theme of the person is among the
  // names only then
  const chosen = askedTheme ?? PREVIEW_THEMES[0];
  const theme = names.includes(chosen) ? chosen : names[0];
  // a theme of one mode is seen in that mode only: the other is no way to check it (#1274)
  const themeModes: readonly Scheme[] =
    scene?.themes.find((one) => one.name === theme)?.modes ?? COLOR_MODES;
  const offers = (view: ModeView) =>
    view === 'both' ? themeModes.length > 1 : themeModes.includes(view);
  const modeOff = (view: ModeView) =>
    offers(view)
      ? undefined
      : t(themeModes[0] === 'light' ? '{theme} is light only' : '{theme} is dark only', {
          theme: titleOf(theme),
        });
  // the dropdown open, for the tone of its button
  const [panel, setPanel] = useState<Panel | null>(null);
  const tracks = (id: Panel) => ({
    onmdsDropdownVisible: () => setPanel(id),
    onmdsDropdownHide: () => setPanel((open) => (open === id ? null : open)),
  });
  const [prefs, setPrefs] = useState<ScenePrefs>(DEFAULT_PREFS);
  const [view, setView] = useState<View>('scenes');
  const page = VIEWS.find((one) => one.id === view)!;
  const picked: ModeView = askedMode ?? 'light';
  const mode: ModeView = offers(picked) ? picked : themeModes[0];
  const [contrast, setContrast] = useState<ContrastMode>('no-preference');
  const [width, setWidth] = useState<Width>('full');
  const [loaded, setLoaded] = useState(0);
  const schemes: Scheme[] = mode === 'both' ? ['light', 'dark'] : [mode];

  // a choice writes the address, replaced in place (a choice is no page to go back to), with the
  // other half of it as the last render has it: the listener of the select is added once
  const choice = {
    theme: (next: string) => onChoose(next, picked),
    mode: (next: ModeView) => onChoose(chosen, next),
  };
  const choose = useRef(choice);
  choose.current = choice;

  useEffect(() => {
    const element = select.current;
    if (!element) return;
    const change = (event: Event) => {
      const { value } = (event as CustomEvent<{ value?: string }>).detail ?? {};
      if (value) choose.current.theme(value);
    };
    element.addEventListener('mdsInputSelectChange', change);
    return () => element.removeEventListener('mdsInputSelectChange', change);
  }, []);

  useEffect(() => {
    schemes.forEach((scheme, index) => {
      const frame = frames.current[index]?.contentDocument;
      if (!frame?.documentElement) return;
      applyFrame(frame, {
        theme,
        scheme,
        contrast: contrast === 'more',
        css: scene?.css,
        modes: themeModes,
      });
      applyPrefs(frame, prefs);
    });
  }, [theme, prefs, mode, contrast, scene, loaded]);

  // the frames side by side scroll together, so the same card is in view in both modes: the
  // frame the person scrolls leads, the other jumps to it (the scene scrolls smoothly, and a
  // smooth follower would hand back each step of its way), and the scroll event of that jump,
  // at the position it was given, is its echo, not a scroll of the person
  useEffect(() => {
    const panes = frames.current
      .slice(0, schemes.length)
      .map((frame) => frame?.contentWindow)
      .filter((pane): pane is Window => !!pane);
    if (panes.length < 2) return;
    const echoes = new Map<Window, number>();
    const listeners = panes.map((pane) => {
      const follow = () => {
        const top = Math.round(pane.scrollY);
        if (echoes.get(pane) === top) {
          echoes.delete(pane);
          return;
        }
        panes.forEach((other) => {
          if (other === pane || Math.round(other.scrollY) === top) return;
          echoes.set(other, top);
          other.scrollTo({ top, behavior: 'instant' });
        });
      };
      pane.addEventListener('scroll', follow);
      return () => pane.removeEventListener('scroll', follow);
    });
    return () => listeners.forEach((remove) => remove());
  }, [mode, loaded]);

  return (
    <div class="studio-theme">
      <div class="studio-frames" data-width={width}>
        {schemes.map((scheme, index) => (
          <iframe
            ref={(frame) => {
              frames.current[index] = frame;
            }}
            class="studio-scene"
            src={page.page}
            title={t(scheme === 'light' ? '{title}, light mode' : '{title}, dark mode', {
              title: t(page.title),
            })}
            onLoad={() => setLoaded((count) => count + 1)}
          />
        ))}
      </div>
      <div class="studio-toolbar" role="toolbar" aria-label={t('Theme')}>
        <mds-input-select ref={select} aria-label={t('Theme')} size="md" value={theme}>
          {names.map((name) => (
            <option value={name}>{titleOf(name)}</option>
          ))}
        </mds-input-select>
        {AXES.filter((axis) => READY.has(axis.id)).map((axis) => (
          <mds-button
            id={axisId(axis.id)}
            icon={axis.icon}
            variant="dark"
            tone={panel === axis.id ? 'strong' : 'text'}
            aria-label={t(axis.label)}
            title={t(axis.label)}
          ></mds-button>
        ))}
        <mds-button
          id={PREVIEW_ID}
          icon="mi/outline/straighten"
          variant="dark"
          tone={panel === 'preview' ? 'strong' : 'text'}
          aria-label={t('Preview')}
          title={t('Preview')}
        ></mds-button>
      </div>
      {/* the controls of an axis, and those of the preview, open from their button above the
          bar; a group, not a menu */}
      <mds-dropdown
        target={`#${axisId('preferences')}`}
        placement="top"
        strategy="fixed"
        role="group"
        aria-labelledby={PREFS_TITLE}
        {...tracks('preferences')}
      >
        <ScenePrefsPanel
          mode={mode}
          onMode={(next) => choose.current.mode(next)}
          modeOff={modeOff}
          contrast={contrast}
          onContrast={setContrast}
          prefs={prefs}
          onChange={setPrefs}
        />
      </mds-dropdown>
      <mds-dropdown
        target={`#${PREVIEW_ID}`}
        placement="top"
        strategy="fixed"
        role="group"
        aria-labelledby={PREVIEW_TITLE}
        {...tracks('preview')}
      >
        <PreviewPanel view={view} onView={setView} width={width} onWidth={setWidth} />
      </mds-dropdown>
    </div>
  );
}
