import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { semantic } from '@maggioli-design-system/design-tokens/semantic.config';
import logo from '@maggioli-design-system/identity/dist/internal/magma-design-system/logo-magma.svg?url';
import { App } from './app.js';
import { readDraft } from './draft.js';
import { gateVerdict, type GateVerdict } from './gate.js';
import { sceneStyle } from './scene-css.js';
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
  const verdict = useMemo(() => (config ? gateVerdict(config) : null), [config]);

  return (
    <div class="studio">
      <StudioBar route={route} verdict={verdict} />
      <div class="studio-section" hidden={route.section !== 'colors'}>
        <App
          view={colorsView}
          onNavigate={(view) => navigate({ section: 'colors', view })}
          onConfig={setConfig}
        />
      </div>
      {route.section === 'theme' && <ThemePage config={config} />}
      {route.section === 'behavior' && <BehaviorPageView page={route.page} />}
    </div>
  );
}

/** The verdict of the contrast gate, first in the Colors menu. */
function GateBadge({ verdict }: { verdict: GateVerdict | null }) {
  if (!verdict) return null;
  if (verdict.state === 'pass')
    return (
      <mds-badge
        variant="success"
        label="All contrasts are OK"
        title={
          verdict.accepted
            ? `${verdict.accepted} known offender(s) accepted by the baseline of design-tokens`
            : undefined
        }
      ></mds-badge>
    );
  if (verdict.state === 'fail')
    return (
      <mds-badge
        variant="error"
        label={`${verdict.violations} contrast${verdict.violations === 1 ? '' : 's'} below target`}
      ></mds-badge>
    );
  return (
    <mds-badge variant="warning" label="Contrast not measured" title={verdict.message}></mds-badge>
  );
}

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
            icon={item.icon}
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
/** The axes with a panel today; the others come with the axis panel (#696). */
const READY: ReadonlySet<Axis> = new Set(['preferences']);

/**
 * The themes the studio previews: the ones Magma ships, without the names kept until the next
 * major (semantic.config.ts, `deprecated`).
 */
export const PREVIEW_THEMES = Object.entries(semantic.themes)
  .filter(([, def]) => typeof def === 'string' || !def.deprecated)
  .map(([name]) => name);

const titleOf = (name: string): string => name.charAt(0).toUpperCase() + name.slice(1);

/*
  What the author checks the theme UNDER, apart from what they edit: the header over the frame
  holds it, the bar at the bottom holds the theme and its axes (#697, "The right column"). The
  mode and the contrast are not exported: they are the preferences of the person.
*/

export type Scheme = 'light' | 'dark';
type ModeView = Scheme | 'both';
const MODE_VIEWS: ReadonlyArray<{ id: ModeView; label: string }> = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'both', label: 'Both' },
];

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
 * breakpoint up. style.css sizes the frame with `--breakpoint-<id>`; the label reads the same
 * property, so it never names a width the frame does not have.
 */
const WIDTHS = ['full', 'desktop', 'tablet', 'mobile'] as const;
type Width = (typeof WIDTHS)[number];
const widthLabel = (width: Width): string => {
  if (width === 'full') return 'Full width';
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(`--breakpoint-${width}`)
    .trim();
  return value ? `${titleOf(width)} (${value})` : titleOf(width);
};

const PREF_CLASSES = [
  'pref-mode-light',
  'pref-mode-dark',
  'pref-mode-system',
  'pref-contrast-more',
  'pref-contrast-no-preference',
  'pref-contrast-system',
];

/**
 * Sets on the document of a frame what the author checks the theme under: the theme, the mode
 * and the contrast, written as the preferences of Magma write them on <html> (`data-magma-pref`,
 * `pref-mode-*`, `pref-contrast-*`, mds-pref-mode and mds-pref-contrast), so the frame follows
 * them and neither the system nor the choice the person stored. The scene has no mode nor
 * contrast of its own (scene.html): two frames side by side share the storage of the origin, and
 * a stored mode would bring both to the same one.
 */
export function applyFrame(
  scene: Document,
  {
    theme,
    scheme,
    contrast,
    css,
  }: { theme: string; scheme: Scheme; contrast: boolean; css?: string },
) {
  const html = scene.documentElement;
  html.setAttribute('data-theme-name', theme);
  html.setAttribute('data-magma-pref', '');
  html.classList.remove(...PREF_CLASSES);
  html.classList.add(
    `pref-mode-${scheme}`,
    contrast ? 'pref-contrast-more' : 'pref-contrast-no-preference',
  );
  // the palette and the themes of the configuration (scene-css.ts), over the stylesheets of the
  // installed Magma: an unlayered rule wins over their layers, whatever their order
  let style = scene.getElementById(CONFIGURATION_STYLE) as HTMLStyleElement | null;
  if (css === undefined) {
    style?.remove();
    return;
  }
  if (!style) {
    style = scene.createElement('style');
    style.id = CONFIGURATION_STYLE;
    scene.head.append(style);
  }
  if (style.textContent !== css) style.textContent = css;
}

const CONFIGURATION_STYLE = 'studio-configuration';

/**
 * The Theme section: the theme on a scene of a product in an iframe, the header of what it is
 * checked under over it, the bar of the theme and its axes at the bottom. The scene is a document
 * of its own: what is set on its <html> and the preferences of its own panel move it and leave
 * the studio alone (#695, "The dogfooding constraint"). Both modes are two frames side by side,
 * scrolled together; the panel of the preferences opens in the first. The select offers the
 * themes of the configuration the person edits, which the frame paints (scene-css.ts); until the
 * configuration is loaded, the themes Magma ships.
 */
function ThemePage({ config }: { config: MagmaConfig | null }) {
  const frames = useRef<Array<HTMLIFrameElement | null>>([]);
  const select = useRef<HTMLElement>(null);
  const scene = useMemo(() => (config ? sceneStyle(config) : null), [config]);
  const names = scene?.themes.map((one) => one.name) ?? PREVIEW_THEMES;
  const [chosen, setTheme] = useState(PREVIEW_THEMES[0]);
  const theme = names.includes(chosen) ? chosen : names[0];
  const [panel, setPanel] = useState<Axis | null>(null);
  const [view, setView] = useState<View>('scenes');
  const page = VIEWS.find((one) => one.id === view)!;
  const [mode, setMode] = useState<ModeView>('light');
  const [contrast, setContrast] = useState(false);
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
      applyFrame(frame, { theme, scheme, contrast, css: scene?.css });
      const pref = frame.getElementById('studio-pref');
      if (pref) pref.hidden = index > 0 || panel !== 'preferences';
    });
  }, [theme, panel, mode, contrast, scene, loaded]);

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
      <div class="studio-theme-head" role="toolbar" aria-label="Preview">
        <mds-filter
          aria-label="View"
          onmdsFilterChange={(event: CustomEvent<{ value?: string }>) => {
            const value = event.detail?.value as View | undefined;
            if (value) setView(value);
          }}
        >
          {VIEWS.map((one) => (
            <mds-filter-item
              label={one.label}
              value={one.id}
              selected={one.id === view}
            ></mds-filter-item>
          ))}
        </mds-filter>
        <div class="studio-theme-checks">
          <mds-filter
            aria-label="Mode"
            onmdsFilterChange={(event: CustomEvent<{ value?: string }>) => {
              const value = event.detail?.value as ModeView | undefined;
              if (value) setMode(value);
            }}
          >
            {MODE_VIEWS.map((view) => (
              <mds-filter-item
                label={view.label}
                value={view.id}
                selected={view.id === mode}
              ></mds-filter-item>
            ))}
          </mds-filter>
          <mds-input-select
            aria-label="Width of the frame"
            size="md"
            value={width}
            onmdsInputSelectChange={(event: CustomEvent<{ value?: string }>) => {
              const value = event.detail?.value as Width | undefined;
              if (value) setWidth(value);
            }}
          >
            {WIDTHS.map((one) => (
              <option value={one} selected={one === width}>
                {widthLabel(one)}
              </option>
            ))}
          </mds-input-select>
          <mds-input-switch
            type="switch"
            checked={contrast}
            onmdsInputSwitchChange={(event: CustomEvent<{ checked: boolean }>) =>
              setContrast(event.detail.checked)
            }
          >
            More contrast
          </mds-input-switch>
        </div>
      </div>
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
        {AXES.map((axis) => (
          <mds-button
            icon={axis.icon}
            variant="dark"
            tone={panel === axis.id ? 'strong' : 'text'}
            aria-label={axis.label}
            aria-pressed={panel === axis.id ? 'true' : 'false'}
            disabled={!READY.has(axis.id)}
            title={
              READY.has(axis.id) ? axis.label : `${axis.label}: comes with the axis panel (#696)`
            }
            onClick={() => setPanel((open) => (open === axis.id ? null : axis.id))}
          ></mds-button>
        ))}
      </div>
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
