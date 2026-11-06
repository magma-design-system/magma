import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { semantic } from '@maggioli-design-system/design-tokens/semantic.config';
import { COLOR_MODES } from '@maggioli-design-system/design-tokens/src/lib/theme-manifest.mjs';
import logo from '@maggioli-design-system/identity/dist/internal/magma-design-system/logo-magma.svg?url';
import { App } from './app.js';
import { readDraft } from './draft.js';
import type { GateVerdict } from './gate.js';
import { GateBadge } from './verdict.js';
import { sceneStyle } from './scene-css.js';
import { useThemeChoices } from './theme-choices.js';
import { applyFrame, type Scheme } from './frame.js';

export { applyFrame, type Scheme } from './frame.js';
import {
  applyPrefs,
  DEFAULT_PREFS,
  Modes,
  PREFS_TITLE,
  ScenePrefsPanel,
  type Choice,
  type ContrastMode,
  type ModeView,
  type ScenePrefs,
} from './scene-prefs.js';
import {
  BEHAVIOR_PAGES,
  COLORS_PAGES,
  HOME,
  hrefOf,
  navigate,
  useRoute,
  type BehaviorPage,
  type ColorsView,
  type MenuItem,
  type Route,
} from './routes.js';

/*
  The shell of the studio (#695): the bar of the application and its three sections, built with
  the components of the Magma installed where the studio runs (vendor.ts). The bar follows the
  app-shell block of Magma; Colors and Behavior open their pages from a menu, a case the block
  does not have yet (#695).
*/

/** The page a start with no address opens: the view of the Colors section the draft was on. */
function startRoute(): Route {
  const view = readDraft()?.view as ColorsView | undefined;
  return COLORS_PAGES.some((page) => page.id === view) ? { section: 'colors', view: view! } : HOME;
}

/** The version of the Magma the studio runs on, written into the page by vendor.ts. */
const magmaVersionOf = () =>
  document.querySelector<HTMLMetaElement>('meta[name="magma-version"]')?.content || undefined;

export function Studio() {
  const route = useRoute(startRoute());
  // the Colors view stays mounted under the other sections, so its work is not lost
  const [colorsView, setColorsView] = useState<ColorsView>(
    route.section === 'colors' ? route.view : 'colors',
  );
  useEffect(() => {
    if (route.section === 'colors') setColorsView(route.view);
  }, [route]);
  const [config, setConfig] = useState<MagmaConfig | null>(null);
  // the App judges the working config with the contrast gate at every edit (gate.ts)
  const [verdict, setVerdict] = useState<GateVerdict | null>(null);

  return (
    <div class="studio">
      <StudioBar route={route} verdict={verdict} />
      <div class="studio-section" hidden={route.section !== 'colors'}>
        <App
          view={colorsView}
          onNavigate={(view) => navigate({ section: 'colors', view })}
          onConfig={setConfig}
          onGate={setVerdict}
        />
      </div>
      {route.section === 'theme' && <ThemePage config={config} />}
      {route.section === 'behavior' && <BehaviorPageView page={route.page} />}
    </div>
  );
}

/**
 * The icon of a link of a menu: the outline one, the filled one (baseline) for the page shown, so
 * the current page reads at a glance beside its weak tone (vittorio, 2026-11-06). routes.ts names
 * the baseline icon; Material draws some the same in both sets (contrast, pattern).
 */
export const menuIcon = (icon: string, current: boolean): string =>
  current ? icon : icon.replace('/baseline/', '/outline/');

/** The links of a menu, the current one marked; a page apart comes after a separator. */
function MenuLinks<Id extends string>({
  items,
  current,
  routeOf,
}: {
  items: MenuItem<Id>[];
  current?: Id;
  routeOf: (id: Id) => Route;
}) {
  return (
    <>
      {items.map((item) => (
        <>
          {item.apart && <mds-separator></mds-separator>}
          <mds-button
            href={hrefOf(routeOf(item.id))}
            icon={menuIcon(item.icon, item.id === current)}
            variant="dark"
            tone={item.id === current ? 'weak' : 'text'}
            aria-current={item.id === current ? 'page' : undefined}
            class="studio-menu-link"
          >
            {item.label}
          </mds-button>
        </>
      ))}
    </>
  );
}

const colorsRoute = (view: ColorsView): Route => ({ section: 'colors', view });
const behaviorRoute = (page: BehaviorPage): Route => ({ section: 'behavior', page });

function StudioBar({ route, verdict }: { route: Route; verdict: GateVerdict | null }) {
  const colorsMenu = useRef<HTMLElement & { visible?: boolean }>(null);
  const behaviorMenu = useRef<HTMLElement & { visible?: boolean }>(null);
  // following a link of a menu closes it
  useEffect(() => {
    for (const menu of [colorsMenu.current, behaviorMenu.current]) if (menu) menu.visible = false;
  }, [hrefOf(route)]);
  const colorsView = route.section === 'colors' ? route.view : undefined;
  const behaviorPage = route.section === 'behavior' ? route.page : undefined;
  const sectionTone = (section: Route['section']) => (route.section === section ? 'weak' : 'text');
  const version = magmaVersionOf();

  return (
    <>
      <mds-header class="studio-header">
        <mds-header-bar>
          <a class="studio-product" href={hrefOf(HOME)}>
            <img src={logo} alt="" width={40} height={40} />
            <span class="studio-product-name">
              <mds-text typography="h6" tag="p">
                Magma Studio
              </mds-text>
              {/* the Magma the studio runs on, under its name */}
              {version && (
                <mds-text typography="label" tag="p" class="studio-product-version">
                  {`for Magma v${version}`}
                </mds-text>
              )}
            </span>
          </a>
          <mds-button
            slot="nav"
            id="studio-colors"
            variant="dark"
            tone={sectionTone('colors')}
            icon="mi/baseline/expand-more"
            icon-position="right"
          >
            Colors
            {/* the pairs that fail the contrast gate, on the section, in view wherever the
                configuration is edited (#698); no pulse, the count moves with every edit */}
            {verdict?.state === 'fail' && (
              <mds-notification
                slot="notification"
                value={verdict.violations}
                max={99}
              ></mds-notification>
            )}
          </mds-button>
          <mds-button
            slot="nav"
            href={hrefOf({ section: 'theme' })}
            variant="dark"
            tone={sectionTone('theme')}
            aria-current={route.section === 'theme' ? 'page' : undefined}
          >
            Theme
          </mds-button>
          <mds-button
            slot="nav"
            id="studio-behavior"
            variant="dark"
            tone={sectionTone('behavior')}
            icon="mi/baseline/expand-more"
            icon-position="right"
          >
            Behavior
          </mds-button>
        </mds-header-bar>
        <nav slot="menu" class="studio-menu" aria-label="Studio">
          <mds-text typography="detail" tag="p" class="studio-menu-title">
            Colors
          </mds-text>
          <MenuLinks items={COLORS_PAGES} current={colorsView} routeOf={colorsRoute} />
          <mds-separator></mds-separator>
          <mds-button
            href={hrefOf({ section: 'theme' })}
            icon="mi/baseline/format-size"
            variant="dark"
            tone={sectionTone('theme')}
            aria-current={route.section === 'theme' ? 'page' : undefined}
            class="studio-menu-link"
          >
            Theme
          </mds-button>
          <mds-separator></mds-separator>
          <mds-text typography="detail" tag="p" class="studio-menu-title">
            Behavior
          </mds-text>
          <MenuLinks items={BEHAVIOR_PAGES} current={behaviorPage} routeOf={behaviorRoute} />
        </nav>
      </mds-header>
      <mds-dropdown ref={colorsMenu} target="#studio-colors" placement="bottom" strategy="fixed">
        <div class="studio-dropdown">
          <div class="studio-dropdown-head">
            <GateBadge verdict={verdict} />
          </div>
          <mds-separator></mds-separator>
          <MenuLinks items={COLORS_PAGES} current={colorsView} routeOf={colorsRoute} />
        </div>
      </mds-dropdown>
      <mds-dropdown
        ref={behaviorMenu}
        target="#studio-behavior"
        placement="bottom"
        strategy="fixed"
      >
        <div class="studio-dropdown">
          <MenuLinks items={BEHAVIOR_PAGES} current={behaviorPage} routeOf={behaviorRoute} />
        </div>
      </mds-dropdown>
    </>
  );
}

/** The axes of a theme the bar of the Theme section opens, in the order of #696. */
const AXES = [
  { id: 'typography', label: 'Typography', icon: 'mi/baseline/format-size' },
  { id: 'shape', label: 'Shape', icon: 'mi/baseline/rounded-corner' },
  { id: 'density', label: 'Density', icon: 'mi/baseline/density-medium' },
  { id: 'depth', label: 'Depth', icon: 'mi/baseline/layers' },
  { id: 'preferences', label: 'Preferences of the person', icon: 'mi/baseline/accessibility' },
  { id: 'dimension', label: 'Dimension', icon: 'mi/baseline/straighten' },
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
  { id: 'scenes', label: 'Scenes', page: 'scene.html', title: 'The theme on a page of a product' },
  { id: 'groups', label: 'Groups', page: 'groups.html', title: 'The theme on every component' },
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
const widthLabel = (width: Width): string => {
  if (width === 'full') return 'Full width';
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(`--breakpoint-${width}`)
    .trim();
  return value ? `${titleOf(width)} (${value})` : titleOf(width);
};
/** The words of the choice of the width (`Modes`): its name, and each width. */
const widthWords = (): Record<string, string> => ({
  label: 'Width',
  ...Object.fromEntries(WIDTHS.map(({ mode }) => [mode, widthLabel(mode)])),
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
  return (
    <div class="studio-panel">
      <mds-text id={PREVIEW_TITLE} typography="h6" tag="h2">
        Preview
      </mds-text>
      <mds-separator></mds-separator>
      <div class="studio-choice">
        <mds-text typography="caption" tag="p">
          <b>View</b> {page.title}
        </mds-text>
        <mds-tab
          fill
          aria-label="View"
          onmdsTabChange={(event: CustomEvent<{ id: number; value?: string }>) => {
            const value = event.detail?.value as View | undefined;
            if (value) onView(value);
          }}
        >
          {VIEWS.map((one) => (
            <mds-tab-item
              type="button"
              label={one.label}
              value={one.id}
              selected={one.id === view}
            ></mds-tab-item>
          ))}
        </mds-tab>
      </div>
      <Modes words={widthWords()} choices={WIDTHS} value={width} onValue={onWidth} />
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
 * themes of the configuration the person edits, which the frame paints (scene-css.ts); until the
 * configuration is loaded, the themes Magma ships.
 */
function ThemePage({ config }: { config: MagmaConfig | null }) {
  const frames = useRef<Array<HTMLIFrameElement | null>>([]);
  const select = useRef<HTMLElement>(null);
  // the choices of the Themes page (names, accents, modes) shape the themes the frame paints
  const choices = useThemeChoices();
  const scene = useMemo(() => (config ? sceneStyle(config, choices) : null), [config, choices]);
  const names = scene?.themes.map((one) => one.name) ?? PREVIEW_THEMES;
  const [chosen, setTheme] = useState(PREVIEW_THEMES[0]);
  const theme = names.includes(chosen) ? chosen : names[0];
  // a theme of one mode is seen in that mode only: the other is no way to check it (#1274)
  const themeModes: readonly Scheme[] =
    scene?.themes.find((one) => one.name === theme)?.modes ?? COLOR_MODES;
  const offers = (view: ModeView) =>
    view === 'both' ? themeModes.length > 1 : themeModes.includes(view);
  const modeOff = (view: ModeView) =>
    offers(view) ? undefined : `${titleOf(theme)} is ${themeModes[0]} only`;
  // the dropdown open, for the tone of its button
  const [panel, setPanel] = useState<Panel | null>(null);
  const tracks = (id: Panel) => ({
    onmdsDropdownVisible: () => setPanel(id),
    onmdsDropdownHide: () => setPanel((open) => (open === id ? null : open)),
  });
  const [prefs, setPrefs] = useState<ScenePrefs>(DEFAULT_PREFS);
  const [view, setView] = useState<View>('scenes');
  const page = VIEWS.find((one) => one.id === view)!;
  const [picked, setMode] = useState<ModeView>('light');
  const mode: ModeView = offers(picked) ? picked : themeModes[0];
  const [contrast, setContrast] = useState<ContrastMode>('no-preference');
  const [width, setWidth] = useState<Width>('full');
  const [loaded, setLoaded] = useState(0);
  const schemes: Scheme[] = mode === 'both' ? ['light', 'dark'] : [mode];

  useEffect(() => {
    const element = select.current;
    if (!element) return;
    const change = (event: Event) => {
      const { value } = (event as CustomEvent<{ value?: string }>).detail ?? {};
      if (value) setTheme(value);
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
            ref={(frame) => (frames.current[index] = frame)}
            class="studio-scene"
            src={page.page}
            title={`${page.title}, ${scheme} mode`}
            onLoad={() => setLoaded((count) => count + 1)}
          />
        ))}
      </div>
      <div class="studio-toolbar" role="toolbar" aria-label="Theme">
        <mds-input-select ref={select} aria-label="Theme" size="md" value={theme}>
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
            aria-label={axis.label}
            title={axis.label}
          ></mds-button>
        ))}
        <mds-button
          id={PREVIEW_ID}
          icon="mi/outline/straighten"
          variant="dark"
          tone={panel === 'preview' ? 'strong' : 'text'}
          aria-label="Preview"
          title="Preview"
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
          onMode={setMode}
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

/** What each page of Behavior will hold, and where it comes from. */
const BEHAVIOR_SUMMARY: Record<BehaviorPage, string> = {
  'design-language':
    'The rules of composition every page of a product follows: rhythm, density, actions, titles, surfaces and widths.',
  patterns:
    'How a task across components is solved in every product, with the narrower values a product keeps in its magma/patterns folder.',
  blocks:
    'The sections of a page that come back in two patterns or more: the application shell, the page header, the lists.',
};

function BehaviorPageView({ page }: { page: BehaviorPage }) {
  const item = BEHAVIOR_PAGES.find((one) => one.id === page)!;
  return (
    <main class="studio-section studio-page">
      <header class="studio-page-head">
        <div class="studio-page-title">
          <mds-text typography="page" tag="h1">
            {item.label}
          </mds-text>
          <mds-text typography="detail" tag="p" class="studio-muted">
            {BEHAVIOR_SUMMARY[page]}
          </mds-text>
        </div>
      </header>
      <mds-banner variant="info" headline="Read-only, after the theme">
        This page shows what Magma decided and the layer of the product, in the theme of the
        product. It comes after the Theme section (#693, "The plan").
      </mds-banner>
    </main>
  );
}
