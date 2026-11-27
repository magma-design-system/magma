import type { ComponentChild } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Formula } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { resolveExport } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { GroupsManager } from './groups.js';
import { BatchExportModal } from './batch.js';
import { generateScales, singleColorConfig } from './engine/generator.js';
import { ScalesManager, type ScaleOrigin } from './scales.js';
import { SurfaceManager } from './surfaces.js';
import { COLORS_PAGES, type ColorsView } from './shared/routes/routes.js';
import { ThemesManager } from './themes.js';
import { ContrastCheck } from './features/contrast-check/contrast-check.js';
import { GateBadge } from './shared/ui/verdict.js';
import { useStudio, type ExportAction } from './state/studio.js';
import { selectFamily } from './state/palette.js';
import {
  addScale,
  builtinScalesOf,
  changeScale,
  deleteScale,
  renameScale,
  scalesOf,
  type RatioSet,
} from './state/scales.js';
import { toggleGroupSurface, toggleSurface, updateBalances } from './state/surfaces.js';
import { setExports, updateGroup } from './state/groups.js';
import { exportSelection, guard } from './state/exports.js';
import { msg, useT } from './shared/i18n/i18n.js';

/*
  The pages of today's Colors section that no view of the object model has replaced yet (#1403
  took the Palette out to features/colours/): Contrast scales, Semantic surface, Themes, Groups and
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
  scales: msg(
    'The contrast ratios the families solve their steps at, against the background of the mode.',
  ),
  surface: msg(
    'The families that generate surfaces, and the balances: the lightness of the surfaces and borders, the targets of the text.',
  ),
  themes: msg(
    'Each family with surfaces, status aside, is a theme: its name, its accents and the CSS that switches it in.',
  ),
  groups: msg('The ratios, formula and export of each group of the configuration.'),
  contrast: msg(
    'Every pair the contrast gate judges, in each theme and both modes: what the build of Magma would say of this configuration.',
  ),
};

export function App({ view, foot, lead }: AppProps) {
  const t = useT();
  // the work is the state's (state/studio.ts, #1400): the pages read it and change it through its
  // actions, so it outlives them; what is left here is the state of the page
  const studio = useStudio();
  const config = studio.config.value;
  const loadedRatios = studio.loadedRatios.value;
  const selectedName = studio.selectedName.value;
  // the contrast gate on the working config and the themes of the Themes page, at every edit
  // (#698): the badge beside the title, the Contrast check page, the exports
  const report = studio.report.value;
  // the pages of Colors share the region that scrolls: a page opens at its top, never at the
  // scroll the page before it left there
  const content = useRef<HTMLElement>(null);
  useEffect(() => {
    if (content.current) content.current.scrollTop = 0;
  }, [view]);
  const [scalesFormula, setScalesFormula] = useState<Formula>('wcag3');
  const [batchSelection, setBatchSelection] = useState<Set<string>>(() => new Set());
  const [batchModal, setBatchModal] = useState<{ names: string[]; initialExport: string } | null>(
    null,
  );

  const selected = config.colors.find((c) => c.name === selectedName);

  // the variants first, at the top of the groups: the first of them is where the work starts
  // (vittorio, 2026-11-05); the other groups in the order of the configuration
  const groups = useMemo(() => {
    const map = new Map<string, typeof config.colors>();
    if (config.colors.some((color) => color.name.split('.')[0] === 'variant'))
      map.set('variant', []);
    config.colors.forEach((color) => {
      const group = color.name.split('.')[0];
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(color);
    });
    return map;
  }, [config]);

  // the ramps of every family, solved only for the Groups page (a computed of the state)
  const generation = view === 'groups' ? studio.generation.value : null;

  // effective ratio scales: config entries layered over the built-in ones,
  // exactly like the generator merges them. A null entry in the config is
  // the sentinel for a deleted built-in scale and is filtered out.
  const ratioSetFor = (formula: Formula): RatioSet => scalesOf(config.ratios, formula);
  const ratioSet = ratioSetFor(scalesFormula);
  const builtinScales = Object.keys(builtinScalesOf(scalesFormula));

  // origin of a scale relative to the built-in defaults. Comparing stops
  // (rather than mere presence in config.ratios) keeps the tag correct even
  // though writeScale materializes untouched built-ins back into the config.
  const scaleOrigin = (formula: Formula, name: string): ScaleOrigin => {
    const builtin = builtinScalesOf(formula)[name];
    if (!Array.isArray(builtin)) return 'custom';
    const current = ratioSetFor(formula)[name];
    const overridden =
      !!current &&
      (current.length !== builtin.length || current.some((value, i) => value !== builtin[i]));
    return overridden ? 'builtin-overridden' : 'builtin';
  };
  const scaleLabel = (formula: Formula, name: string): string => {
    const origin = scaleOrigin(formula, name);
    if (origin === 'builtin') return t('{name} (built-in)', { name });
    if (origin === 'builtin-overridden') return t('{name} (built-in, overridden)', { name });
    return name;
  };

  const sampleScales = useMemo(() => {
    const map = new Map<string, string[]>();
    if (view !== 'scales' || !selected) return map;
    Object.keys(ratioSet).forEach((name) => {
      try {
        const sampleColor = {
          ...selected,
          ratios: name,
          formula: scalesFormula,
          hueShift: undefined,
        };
        const scales = generateScales(singleColorConfig(config, sampleColor));
        map.set(
          name,
          (scales.get(selected.name)?.light ?? []).map((step) => step.value),
        );
      } catch {
        // an inconsistent scale under edit should not break the view
      }
    });
    return map;
  }, [view, scalesFormula, JSON.stringify(config), selectedName]);

  // an export while the gate fails asks first: never the silent default (#698). The dialog is the
  // shell's, so the exit of the bar asks it from any section
  const ask = (action: ExportAction) => guard(studio, action);

  // a dialog of the page closes when another page opens: the dialog of the gate leads from the
  // Batch export of Groups to Contrast check
  const shownView = useRef(view);
  useEffect(() => {
    if (shownView.current === view) return;
    shownView.current = view;
    setBatchModal(null);
  }, [view]);

  const toggleBatch = (name: string) =>
    setBatchSelection((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  // color names in config order, for a stable modal list
  const namesInOrder = (predicate: (color: (typeof config.colors)[number]) => boolean): string[] =>
    config.colors.filter(predicate).map((color) => color.name);

  const openBatch = () =>
    setBatchModal({
      names: namesInOrder((color) => batchSelection.has(color.name)),
      initialExport: '',
    });

  const selectByExport = (exportName: string) => {
    const names = namesInOrder((color) =>
      (resolveExport(color, config) ?? []).includes(exportName),
    );
    setBatchSelection(new Set(names));
    setBatchModal({ names, initialExport: exportName });
  };

  const saveBatch = (names: string[], exportList: string[] | undefined) => {
    setExports(studio, names, exportList);
    setBatchModal(null);
    setBatchSelection(new Set());
  };

  // every export name referenced by the config, for the select-by-export control
  const allExportNames = [
    ...new Set(config.colors.flatMap((color) => resolveExport(color, config) ?? [])),
  ].sort();

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
        {view === 'scales' && (
          <ScalesManager
            config={config}
            formula={scalesFormula}
            ratioSet={ratioSet}
            loaded={scalesOf(loadedRatios, scalesFormula)}
            builtinScales={builtinScales}
            sampleScales={sampleScales}
            selectedName={selectedName}
            labelFor={(name) => scaleLabel(scalesFormula, name)}
            originFor={(name) => scaleOrigin(scalesFormula, name)}
            onSelectColor={(name) => selectFamily(studio, name)}
            onFormulaChange={setScalesFormula}
            onChangeScale={(name, values) => changeScale(studio, scalesFormula, name, values)}
            onRenameScale={(name, nextName) => renameScale(studio, scalesFormula, name, nextName)}
            onAddScale={(copyFrom) => addScale(studio, scalesFormula, copyFrom)}
            onDeleteScale={(name) => deleteScale(studio, scalesFormula, name)}
          />
        )}
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
        {view === 'groups' && (
          <GroupsManager
            config={config}
            groups={groups}
            scaleNamesFor={(formula) => Object.keys(ratioSetFor(formula))}
            labelFor={scaleLabel}
            preview={generation?.scales ?? null}
            previewError={generation?.error ?? null}
            onUpdateGroup={(groupName, patch) => updateGroup(studio, groupName, patch)}
            selected={batchSelection}
            onToggleSelect={toggleBatch}
            exportNames={allExportNames}
            onSelectByExport={selectByExport}
            onOpenBatch={openBatch}
          />
        )}
        {view === 'contrast' && <ContrastCheck report={report} />}
        {foot && <div class="mt-between-sections">{foot}</div>}
      </main>

      {batchModal && (
        <BatchExportModal
          names={batchModal.names}
          config={config}
          initialExport={batchModal.initialExport}
          onSave={saveBatch}
          onExport={(names) =>
            ask({
              label: msg('Export selection'),
              proceed: msg('Export anyway'),
              run: () => exportSelection(studio, names),
            })
          }
          onClose={() => setBatchModal(null)}
        />
      )}
    </div>
  );
}
