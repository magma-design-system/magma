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
import { ColoursPage } from '../features/colours/colours.js';
import { ScalePage } from '../features/scale/scale.js';
import { GroupsPage } from '../features/groups/groups.js';
import { WeightsPage } from '../features/weights/weights.js';
import { ExceptionsPage } from '../features/exceptions/exceptions.js';
import { IntroductionPage } from '../features/introduction/introduction.js';
import { OpeningPage } from '../features/opening/opening.js';
import { forgetOpening, undoOpening } from '../state/opening.js';
import { forgetUndo, undoLast } from '../state/undo.js';
import { reasonText } from '../state/draft.js';
import { resolveConflict } from '../state/work.js';
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
  // the page of the work, a stage or a page beside one, kept in the draft: the opening resumes it
  useEffect(() => {
    if (placeOf(route)) studio.workPlace.value = hrefOf(route);
  }, [hrefOf(route)]);
  // the foot of a stage, handed to its page (stages.tsx); none on a page that is no stage
  const foot = placeOf(route)?.place === 'stage' ? <StageFoot route={route} /> : undefined;

  return (
    <LangProvider value={lang}>
      <StudioContext.Provider value={studio}>
        {/* how wide the bar and the page are (widths, style.css): the whole window on a page of the
            work, the column of a page on the introduction */}
        <div class="studio" data-box={route.section === 'introduction' ? 'page' : 'workspace'}>
          <StudioBar route={route} />
          {/* the stages in order, on a stage and on a page beside one (stages.tsx) */}
          <StageBar route={route} onOpen={(next) => nav.navigate(next)} />
          <WorkNotices />
          {route.section === 'colours' && (
            <div class="studio-section">
              <ColoursPage foot={foot} />
            </div>
          )}
          {route.section === 'scale' && (
            <div class="studio-section">
              <ScalePage route={route} onOpen={(next, options) => nav.navigate(next, options)} />
            </div>
          )}
          {route.section === 'groups' && (
            <div class="studio-section">
              <GroupsPage />
            </div>
          )}
          {route.section === 'weights' && (
            <div class="studio-section">
              <WeightsPage foot={foot} />
            </div>
          )}
          {route.section === 'colors' && (
            <div class="studio-section">
              <App view={route.view} foot={foot} lead={<StageLead route={route} />} />
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
          <PendingExport onReview={() => nav.navigate({ section: 'colors', view: 'contrast' })} />
          <UndoToasts />
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
 * What keeps the preset from loading or saving, over every page (#1403: from the head of the pages
 * of Colors, which every page did not have): the error of a preset that did not load; a draft with
 * edits of its own over a source that changed, which asks which to keep; the reason the command
 * refuses saves. A region of the page under the bar and the stages, at the width of a text.
 */
function WorkNotices() {
  const studio = useStudio();
  const t = useT();
  const notice = studio.notice.value;
  const conflict = studio.conflict.value;
  const served = studio.served.value;
  const shown = notice || conflict || served?.readOnly;
  if (!shown) return null;
  return (
    <div class="flex-none px-(--magma-width-page-gutter) pt-inset">
      {notice ? (
        <mds-banner class="max-w-text" variant="error">
          {say(t, notice)}
        </mds-banner>
      ) : conflict ? (
        <mds-banner class="draft-conflict max-w-text" variant="warning">
          {t('{reason}, and the draft restored from this browser has edits of its own.', {
            reason: reasonText(t, conflict.reason),
          })}
          <mds-button
            slot="action"
            type="button"
            variant="dark"
            tone="outline"
            label={t(conflict.label)}
            onClick={() => resolveConflict(studio, true)}
          ></mds-button>
          <mds-button
            slot="action"
            type="button"
            label={t('Keep the draft')}
            onClick={() => resolveConflict(studio, false)}
          ></mds-button>
        </mds-banner>
      ) : (
        <mds-banner class="max-w-text" variant="info">
          {t('Saving is off: {reason}', { reason: served?.readOnly ?? '' })}
        </mds-banner>
      )}
    </div>
  );
}

/**
 * The toasts that undo what took work away, with no confirmation (confirm-action, `act-then-undo`:
 * the toast with Undo, `duration=0 dismissible`): a preset opened over work with changes (#1402),
 * a family or a scale deleted, a scale taken back to its built-in steps (#1403, state/undo.ts). Each stays until closed; closed by the person or by Undo, what it kept
 * goes either way. On document.body, in the region of the toasts of the application, as the dialog
 * of the gate stands.
 */
function UndoToasts() {
  const studio = useStudio();
  const t = useT();
  const opening = studio.lastOpening.value;
  const undo = studio.lastUndo.value;
  return createPortal(
    <mds-toast-region>
      {opening && (
        <mds-toast
          visible
          duration={0}
          dismissible
          onmdsToastClose={() => {
            if (studio.lastOpening.peek() === opening) forgetOpening(studio);
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
      {undo && (
        <mds-toast
          visible
          duration={0}
          dismissible
          data-undo
          onmdsToastClose={() => {
            if (studio.lastUndo.peek() === undo) forgetUndo(studio);
          }}
        >
          {say(t, undo.said)}
          <mds-button
            slot="action"
            size="sm"
            variant="dark"
            tone="outline"
            label={t('Undo')}
            onClick={() => undoLast(studio)}
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
  // a save would write the draft over a file that changed while a conflict waits for an answer:
  // the exit waits too, the notice over the page says why (WorkNotices, #1403: Save went from the
  // head of the pages of Colors, where it waited the same way)
  const held = saves && studio.conflict.value !== null;
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
          {/* what stands outside the stages: Groups, the Theme section, the rules (#1403) */}
          <mds-button
            slot="nav"
            href={hrefOf({ section: 'groups' })}
            variant="dark"
            tone={sectionTone('groups')}
            aria-current={route.section === 'groups' ? 'page' : undefined}
            label={t('Groups')}
          ></mds-button>
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
            disabled={held || undefined}
            onmdsButtonDropdownClick={() => guard(studio, exitOf(studio))}
          >
            <ConfigItems actions={formats} />
          </mds-button-dropdown>
        </mds-header-bar>
        <div slot="menu" class="studio-menu">
          {/* what the bar hides on a narrow window (style.css), then the preferences */}
          <nav class="studio-menu-nav" aria-label={t('Studio')}>
            <mds-button
              href={hrefOf({ section: 'groups' })}
              icon="mi/baseline/workspaces"
              variant="dark"
              tone={sectionTone('groups')}
              aria-current={route.section === 'groups' ? 'page' : undefined}
              class="studio-menu-link"
              label={t('Groups')}
            ></mds-button>
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
              disabled={held || undefined}
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
