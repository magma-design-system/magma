import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { semantic } from '@maggioli-design-system/design-tokens/semantic.config';
import logo from '@maggioli-design-system/identity/dist/internal/magma-design-system/logo-magma.svg?url';
import { App } from './app.js';
import { readDraft } from './draft.js';
import { gateVerdict, type GateVerdict } from './gate.js';
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
      {route.section === 'theme' && <ThemePage />}
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
              <mds-text typography="caption" tag="p" class="studio-product-role">
                Product designer
              </mds-text>
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

/**
 * The Theme section: the theme full screen, on a scene of a product in an iframe, and its
 * controls over it. The scene is a document of its own: a theme set on its <html> and the
 * preferences of its own panel move it and leave the studio alone (#695, "The dogfooding
 * constraint").
 */
function ThemePage() {
  const frame = useRef<HTMLIFrameElement>(null);
  const select = useRef<HTMLElement>(null);
  const [theme, setTheme] = useState(PREVIEW_THEMES[0]);
  const [panel, setPanel] = useState<Axis | null>(null);
  const [loaded, setLoaded] = useState(0);

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
    const scene = frame.current?.contentDocument;
    if (!scene) return;
    scene.documentElement.setAttribute('data-theme-name', theme);
    const pref = scene.getElementById('studio-pref');
    if (pref) pref.hidden = panel !== 'preferences';
  }, [theme, panel, loaded]);

  return (
    <div class="studio-theme">
      <iframe
        ref={frame}
        class="studio-scene"
        src="scene.html"
        title="The theme on a page of a product"
        onLoad={() => setLoaded((count) => count + 1)}
      />
      <div class="studio-toolbar" role="toolbar" aria-label="Theme">
        <mds-input-select ref={select} aria-label="Theme" value={theme}>
          {PREVIEW_THEMES.map((name) => (
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
