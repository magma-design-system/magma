import { useEffect, useRef, useState } from 'preact/hooks';
// the portal of the core: preact/compat would rewrite the events of the whole studio
// (onChange of an input into onInput, onFocus into onfocusin) the moment it is imported
import { createPortal } from 'preact';
import logo from '@maggioli-design-system/identity/dist/internal/magma-design-system/logo-magma.svg?url';
import logoWhite from '@maggioli-design-system/identity/dist/internal/magma-design-system/logo-magma-white.svg?url';
import { App } from '../app.js';
import { useDarkMode } from '../dark-mode.js';
import { ChangesButton, ChangesPanel } from './changes.js';
import { ConfigItems, useConfigMenu } from './config-menu.js';
import { GateDialog } from '../features/contrast-check/gate-dialog.js';
import { RulesPage } from '../features/rules/rules.js';
import { ExceptionsPage } from '../features/exceptions/exceptions.js';
import { IntroductionPage } from '../features/introduction/introduction.js';
import { OpeningPage } from '../features/opening/opening.js';
import { forgetOpening, undoOpening } from '../state/opening.js';
import { ThemePage } from '../theme-section.js';
import { createStudio, say, StudioContext, useStudio, type StudioState } from '../state/studio.js';
import { cancelExport, confirmExport, exitOf, guard } from '../state/exports.js';
import { checkSource } from '../state/work.js';
import { LANGS, LangProvider, useLang, useT } from '../shared/i18n/i18n.js';
import { createRouter, type Router } from './router.js';
import { StageBar, StageFoot, StageLead } from './stages.js';
import {
  BEHAVIOR_PAGES,
  HOME,
  hrefOf,
  placeOf,
  THEME_PAGE,
  type BehaviorPage,
  type ColorsView,
  type MenuItem,
  type Route,
} from '../shared/routes/routes.js';

export { applyFrame, type Scheme } from '../shared/frames/frame.js';

/*
  The shell of the studio (#695; in app/ since #1402): the bar of the application and its three
  sections, the introduction before them, built with the components of the Magma installed where the
  studio runs (vendor.ts). The bar follows the
  app-shell block of Magma; Colors and Behavior open their pages from a menu, a case the block
  does not have yet (#695). Config, after them, is a menu of actions, not a section: it brings a
  configuration in and takes it out from any section (config-menu.tsx). The menu at the end of the
  bar, at every width, holds the preferences of the person (#1336): the language, the mode, the
  contrast, the animations; on a narrow window, where the bar hides its sections, it holds them
  first. The Theme section is a page of its own (theme-section.tsx).
*/

/** The version of the Magma the studio runs on, written into the page by vendor.ts. */
const magmaVersionOf = () =>
  document.querySelector<HTMLMetaElement>('meta[name="magma-version"]')?.content || undefined;

/**
 * What the studio is given, or makes for itself: a host (#695) hands in the state it keeps and a
 * router on the location it owns.
 */
export interface StudioProps {
  /** The state of the work; without it the studio makes one and checks its source (work.ts). */
  state?: StudioState;
  /** The router; without it the studio follows the hash of the window. */
  router?: Router;
}

/** A value handed in, or one made at the first render and dropped when the studio goes. */
function useOwned<T>(given: T | undefined, make: () => T, drop: (made: T) => void): T {
  const [made] = useState(() => (given ? undefined : make()));
  useEffect(
    () => () => {
      if (made) drop(made);
    },
    [],
  );
  return given ?? made!;
}

export function Studio({ state, router }: StudioProps = {}) {
  // the language of <html lang>, which mds-pref-language of the menu writes: the pages follow it
  const lang = useLang();
  // the work is the state's, not a page's (#1400): the pages of Colors are mounted only under
  // Colors, and the bar, the Theme section and the Start page read the same state
  const studio = useOwned(state, createStudio, (made) => made.dispose());
  const nav = useOwned(router, createRouter, (made) => made.dispose());
  useEffect(() => {
    if (!state) void checkSource(studio);
  }, []);
  const route = nav.route.value;
  const openColors = (view: ColorsView) => nav.navigate({ section: 'colors', view });
  // the foot of a stage, handed to its page (stages.tsx); none on a page that is no stage
  const foot = placeOf(route)?.place === 'stage' ? <StageFoot route={route} /> : undefined;

  return (
    <LangProvider value={lang}>
      <StudioContext.Provider value={studio}>
        <div class="studio">
          <StudioBar route={route} />
          {/* the stages in order, on a stage and on a page beside one (stages.tsx) */}
          <StageBar route={route} onOpen={(next) => nav.navigate(next)} />
          {route.section === 'colors' && (
            <div class="studio-section">
              <App
                view={route.view}
                onNavigate={openColors}
                foot={foot}
                lead={<StageLead route={route} />}
              />
            </div>
          )}
          {route.section === 'exceptions' && <ExceptionsPage foot={foot} />}
          {route.section === 'introduction' && <IntroductionPage />}
          {route.section === 'opening' && <OpeningPage onOpen={(next) => nav.navigate(next)} />}
          {route.section === 'theme' && (
            <ThemePage
              theme={route.theme}
              mode={route.mode}
              onChoose={(theme, mode) =>
                nav.navigate({ section: 'theme', theme, mode }, { replace: true })
              }
            />
          )}
          {route.section === 'behavior' && <RulesPage page={route.page} />}
          <PendingExport onReview={() => openColors('contrast')} />
          <UndoOpening />
        </div>
      </StudioContext.Provider>
    </LangProvider>
  );
}

/**
 * The dialog of the contrast gate, over the whole studio, while an export waits for an answer
 * (state/exports.ts): the Config menu of the bar exports from any section. On document.body, as
 * the modals of Magma stand.
 */
function PendingExport({ onReview }: { onReview: () => void }) {
  const studio = useStudio();
  const action = studio.pendingExport.value;
  if (!action) return null;
  return createPortal(
    <GateDialog
      action={action}
      report={studio.report.value}
      onCancel={() => cancelExport(studio)}
      onConfirm={() => confirmExport(studio)}
      onReview={() => {
        cancelExport(studio);
        onReview();
      }}
    />,
    document.body,
  );
}

/**
 * The toast that undoes an opening (#1402): a preset opened over work with changes, said, with
 * Undo, which brings the work back as it stood; it stays until closed (confirm-action,
 * `act-then-undo`: the toast with Undo, `duration=0 dismissible`). On document.body, in the region
 * of the toasts of the application, as the dialog of the gate stands.
 */
function UndoOpening() {
  const studio = useStudio();
  const t = useT();
  const opening = studio.lastOpening.value;
  return createPortal(
    <mds-toast-region>
      {opening && (
        <mds-toast
          visible
          duration={0}
          dismissible
          onmdsToastClose={(event: CustomEvent<{ reason?: string }>) => {
            // closed by the person or by Undo: the work it kept goes either way
            if (studio.lastOpening.peek() === opening) forgetOpening(studio);
            void event;
          }}
        >
          {say(t, opening.said)}
          <mds-button
            slot="action"
            size="sm"
            variant="dark"
            tone="outline"
            label={t('Undo')}
            onClick={() => undoOpening(studio)}
          ></mds-button>
        </mds-toast>
      )}
    </mds-toast-region>,
    document.body,
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
  const t = useT();
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
            label={t(item.label)}
          ></mds-button>
        </>
      ))}
    </>
  );
}

/**
 * The preferences of the person, at the end of the menu of the bar (#1336): the language first, the
 * one people asked for, then the mode, the contrast and the animations, each control of Magma
 * keeping the choice in this browser. No theme (the studio edits themes, it does not wear one) and
 * no consumption. `live-language`: the studio follows <html lang> at once (i18n.ts), so a change of
 * language needs no reload.
 */
function StudioPrefs() {
  const t = useT();
  return (
    <div class="studio-menu-prefs" role="group" aria-labelledby="studio-menu-prefs">
      <mds-text typography="detail" tag="p" class="studio-menu-title" id="studio-menu-prefs">
        {t('Preferences')}
      </mds-text>
      <mds-pref live-language>
        <mds-pref-language>
          {LANGS.map((code) => (
            <mds-pref-language-item code={code}></mds-pref-language-item>
          ))}
        </mds-pref-language>
        <mds-pref-mode></mds-pref-mode>
        <mds-pref-contrast></mds-pref-contrast>
        <mds-pref-animation></mds-pref-animation>
      </mds-pref>
    </div>
  );
}

const behaviorRoute = (page: BehaviorPage): Route => ({ section: 'behavior', page });

/**
 * The bar of the studio (#1402): the product, then what is outside the stages (the Theme section
 * and the rules, where #1401 left them), then the work, always in view: the changes since the last
 * exit (changes.tsx) and the exit, a split button that saves or downloads the preset in one click,
 * the other formats in its menu (config-menu.tsx). The stages are not in it: they stand under it
 * (stages.tsx, the pattern stages-in-order of the layer of the studio). Chosen on its render
 * (vittorio, 2026-11-27, option A). The menu at the end, at every width, holds the preferences of
 * the person; on a narrow window, where the bar hides the rest, it holds that first.
 */
function StudioBar({ route }: { route: Route }) {
  const studio = useStudio();
  // what the menu of the exit runs, on the state
  const actions = useConfigMenu();
  const exit = exitOf(studio);
  const saves = studio.served.value !== null && !studio.served.value.readOnly;
  // the formats of the menu of the exit: the preset as JSON only when the exit saves it
  const formats = actions.filter((action) => saves || action.id !== 'config');
  const behaviorMenu = useRef<HTMLMdsDropdownElement>(null);
  const changesPanel = useRef<HTMLMdsDropdownElement>(null);
  // following a link of a menu or of the panel of the changes closes it
  useEffect(() => {
    for (const menu of [behaviorMenu.current, changesPanel.current]) if (menu) menu.visible = false;
  }, [hrefOf(route)]);
  const behaviorPage = route.section === 'behavior' ? route.page : undefined;
  const sectionTone = (section: Route['section']) => (route.section === section ? 'weak' : 'text');
  const version = magmaVersionOf();
  const t = useT();
  const dark = useDarkMode();

  return (
    <>
      {/* the menu at every width: the preferences of the person are in it on a wide window too */}
      <mds-header class="studio-header" menu="all">
        <mds-header-bar>
          <a class="studio-product" href={hrefOf(HOME)}>
            {/* the Magma mark of identity, its white version in the dark mode, as the favicon
                (favicons.ts) and the docs site (src/components/frame/Logo.astro) show it */}
            <img src={dark ? logoWhite : logo} alt="" width={40} height={40} />
            <span class="studio-product-name">
              <mds-text typography="h6" tag="p">
                Magma Studio
              </mds-text>
              {/* the Magma the studio runs on, under its name */}
              {version && (
                <mds-text typography="label" tag="p" class="studio-product-version">
                  {t('for Magma v{version}', { version })}
                </mds-text>
              )}
            </span>
          </a>
          <mds-button
            slot="nav"
            href={hrefOf({ section: 'theme' })}
            variant="dark"
            tone={sectionTone('theme')}
            aria-current={route.section === 'theme' ? 'page' : undefined}
            label={t('Theme')}
          ></mds-button>
          <mds-button
            slot="nav"
            id="studio-behavior"
            variant="dark"
            tone={sectionTone('behavior')}
            icon="mi/baseline/expand-more"
            icon-position="right"
            label={t('Behavior')}
          ></mds-button>
          <ChangesButton />
          {/* the exit: saved or downloaded in one click, through the gate; the other formats in
              its menu */}
          <mds-button-dropdown
            slot="nav"
            id="studio-exit"
            icon={saves ? 'mi/baseline/save' : 'mi/baseline/file-download'}
            label={t(exit.label)}
            await={studio.saving.value || undefined}
            onmdsButtonDropdownClick={() => guard(studio, exitOf(studio))}
          >
            <ConfigItems actions={formats} />
          </mds-button-dropdown>
        </mds-header-bar>
        <div slot="menu" class="studio-menu">
          {/* what the bar hides on a narrow window (style.css), then the preferences */}
          <nav class="studio-menu-nav" aria-label={t('Studio')}>
            <mds-button
              href={hrefOf({ section: 'theme' })}
              icon={THEME_PAGE.icon}
              variant="dark"
              tone={sectionTone('theme')}
              aria-current={route.section === 'theme' ? 'page' : undefined}
              class="studio-menu-link"
              label={t(THEME_PAGE.label)}
            ></mds-button>
            <mds-separator></mds-separator>
            <mds-text typography="detail" tag="p" class="studio-menu-title">
              {t('Behavior')}
            </mds-text>
            <MenuLinks items={BEHAVIOR_PAGES} current={behaviorPage} routeOf={behaviorRoute} />
            <mds-separator></mds-separator>
            <mds-text typography="detail" tag="p" class="studio-menu-title">
              {t('Preset')}
            </mds-text>
            <mds-button
              type="button"
              variant="dark"
              tone="text"
              icon={saves ? 'mi/baseline/save' : 'mi/baseline/file-download'}
              class="studio-menu-link"
              label={t(exit.label)}
              data-action="exit"
              onClick={() => guard(studio, exitOf(studio))}
            ></mds-button>
            <ConfigItems actions={formats} />
            <mds-separator></mds-separator>
          </nav>
          <StudioPrefs />
        </div>
      </mds-header>
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
      <ChangesPanel panel={changesPanel} />
    </>
  );
}
