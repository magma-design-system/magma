import type { ComponentChild } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { SurfaceManager } from './surfaces.js';
import { COLORS_PAGES, type ColorsView } from './shared/routes/routes.js';
import { ThemesManager } from './themes.js';
import { ContrastCheck } from './features/contrast-check/contrast-check.js';
import { GateBadge } from './shared/ui/verdict.js';
import { useStudio, type ExportAction } from './state/studio.js';
import { toggleGroupSurface, toggleSurface, updateBalances } from './state/surfaces.js';
import { guard } from './state/exports.js';
import { msg, useT } from './shared/i18n/i18n.js';

/*
  The pages of today's Colors section that no view of the object model has replaced yet (#1403
  took the Palette, Contrast scales and Groups out to features/): Semantic surface, Themes and
  Contrast check, each the whole width of the section, under the head of the page (its title, the
  verdict of the contrast check beside it, one line of what it holds). What brings a preset in is
  the opening, what takes it out the exit of the bar, what keeps it from loading the notices the
  shell shows over every page (app/shell.tsx).
*/

// the views of the Colors section of the studio (shared/routes/routes.ts); 'surface' keeps its id so the
// drafts saved before the views were split keep working
type View = ColorsView;

interface AppProps {
  /** The view the shell routes to. */
  view: View;
  /**
   * The foot of the stage the view is (app/stages.tsx, #1402), at the end of the region that
   * scrolls: the shell hands it in, so the page knows nothing of the flow.
   */
  foot?: ComponentChild;
  /**
   * The head of the stage above the title: the way back of a page beside a stage, the links to the
   * pages beside it (app/stages.tsx, StageLead), handed in by the shell.
   */
  lead?: ComponentChild;
}

/** One line under the title of each view: what it holds. */
const VIEW_SUMMARY: Record<View, string> = {
  surface: msg(
    'The families that generate surfaces, and the balances: the lightness of the surfaces and borders, the targets of the text.',
  ),
  themes: msg(
    'Each family with surfaces, status aside, is a theme: its name, its accents and the CSS that switches it in.',
  ),
  contrast: msg(
    'Every pair the contrast gate judges, in each theme and both modes: what the build of Magma would say of this configuration.',
  ),
};

export function App({ view, foot, lead }: AppProps) {
  const t = useT();
  // the work is the state's (state/studio.ts, #1400): the pages read it and change it through its
  // actions, so it outlives them
  const studio = useStudio();
  const config = studio.config.value;
  // the contrast gate on the working config and the themes of the Themes page, at every edit
  // (#698): the badge beside the title, the Contrast check page, the exports
  const report = studio.report.value;
  // the pages of Colors share the region that scrolls: a page opens at its top, never at the
  // scroll the page before it left there
  const content = useRef<HTMLElement>(null);
  useEffect(() => {
    if (content.current) content.current.scrollTop = 0;
  }, [view]);

  // an export while the gate fails asks first: never the silent default (#698). The dialog is the
  // shell's, so the exit of the bar asks it from any section
  const ask = (action: ExportAction) => guard(studio, action);

  // the head of the page: the first thing of the region that scrolls, or, on Semantic surface,
  // the start of its first column (surfaces.tsx), where the opt-in of the surfaces stands beside it
  // on a wide page. Its title with the verdict of the contrast check beside it (page-header,
  // `status`); no action of its own: the exit of the bar takes the preset out, the opening brings
  // one in (vittorio, 2026-11-27: Save and Reset went with the Palette)
  const pageTop = (
    <header class="studio-page-head">
      <div class="studio-page-title">
        <div class="studio-page-name">
          <mds-text typography="page" tag="h1">
            {t(COLORS_PAGES.find((page) => page.id === view)?.label ?? '')}
          </mds-text>
          <GateBadge verdict={report.verdict} />
        </div>
        <mds-text typography="detail" tag="p" class="studio-muted">
          {t(VIEW_SUMMARY[view])}
        </mds-text>
      </div>
    </header>
  );

  return (
    <div class="layout">
      <main class="content" ref={content}>
        {view !== 'surface' && lead}
        {view !== 'surface' && pageTop}
        {view === 'surface' && (
          <SurfaceManager
            head={pageTop}
            config={config}
            report={report}
            onToggleSurface={(colorName, on) => toggleSurface(studio, colorName, on)}
            onToggleGroupSurface={(groupName, on) => toggleGroupSurface(studio, groupName, on)}
            onUpdateTheme={(mutate) => updateBalances(studio, mutate)}
          />
        )}
        {/* Themes are DERIVED from the surfaces opt-in of the view above - same axis, one step down. */}
        {view === 'themes' && <ThemesManager config={config} report={report} guard={ask} />}
        {view === 'contrast' && <ContrastCheck report={report} />}
        {foot && <div class="mt-between-sections">{foot}</div>}
      </main>
    </div>
  );
}
