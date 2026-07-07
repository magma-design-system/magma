import { useState } from 'preact/hooks';
import type { ColorConfig, Formula, GroupConfig, MagmaConfig } from '../../src/lib/color.mjs';
import { resolveFormula, resolveRatiosName } from '../../src/lib/color.mjs';
import type { ColorScales, Step } from './generator.js';

interface GroupsManagerProps {
  config: MagmaConfig;
  groups: Map<string, ColorConfig[]>;
  scaleNamesFor: (formula: Formula) => string[];
  /** display label for a scale name (tags built-in-only scales) */
  labelFor: (formula: Formula, name: string) => string;
  preview: Map<string, ColorScales> | null;
  previewError: string | null;
  onUpdateGroup: (group: string, patch: GroupConfig) => void;
  /** color names picked for the batch-export selection */
  selected: Set<string>;
  onToggleSelect: (name: string) => void;
  /** existing export group names, to select a whole export at once */
  exportNames: string[];
  onSelectByExport: (exportName: string) => void;
  onOpenBatch: () => void;
}

function CompactRow({ steps }: { steps: Step[] }) {
  return (
    <div class="group-row-cells">
      {steps.map((step) => (
        <div
          class="group-row-cell"
          style={{ background: step.value }}
          title={`${step.value} - ${step.contrast.toFixed(2)}:1`}
        />
      ))}
    </div>
  );
}

/**
 * Group-level management of ratios and formula: the settings written here
 * go to the config "groups" section and apply to every color of the group
 * that does not override them individually.
 */
export function GroupsManager({
  config,
  groups,
  scaleNamesFor,
  labelFor,
  preview,
  previewError,
  onUpdateGroup,
  selected,
  onToggleSelect,
  exportNames,
  onSelectByExport,
  onOpenBatch,
}: GroupsManagerProps) {
  // when on, only selected colors show their scale, to compare them side by side
  const [onlySelectedScales, setOnlySelectedScales] = useState(false);
  return (
    <div class="groups-manager">
      <p class="scales-hint">
        Ratios, formula and export are managed per token group here (the <code>groups</code> section
        of the configuration). Tick colors across groups to set their export together, or pick an
        existing export to load every color that uses it.
      </p>
      <div class="batch-toolbar">
        <span class="scale-usage">{selected.size} selected</span>
        <button disabled={selected.size === 0} onClick={onOpenBatch}>
          batch export
        </button>
        <label class="batch-toggle" title="hide the scales of unselected colors">
          <input
            type="checkbox"
            checked={onlySelectedScales}
            onChange={(e) => setOnlySelectedScales((e.target as HTMLInputElement).checked)}
          />
          only selected scales
        </label>
        <label class="batch-select-export">
          select by export
          <select
            value=""
            onChange={(e) => {
              const value = (e.target as HTMLSelectElement).value;
              if (value) onSelectByExport(value);
              (e.target as HTMLSelectElement).value = '';
            }}
          >
            <option value="">choose...</option>
            {exportNames.map((name) => (
              <option value={name}>{name}</option>
            ))}
          </select>
        </label>
      </div>
      {previewError && <div class="preview-error">{previewError}</div>}
      {[...groups.entries()].map(([groupName, colors]) => {
        const groupConfig = config.groups?.[groupName] ?? {};
        const effectiveFormula = groupConfig.formula ?? ((config.formula ?? 'wcag3') as Formula);
        return (
          <div class="scale-card">
            <div class="scale-card-head">
              <h3 class="group-title">{groupName}</h3>
              <span class="scale-usage">
                {colors.length} color{colors.length === 1 ? '' : 's'}
              </span>
              <div class="group-selects">
                <label>
                  formula
                  <select
                    value={groupConfig.formula ?? ''}
                    onChange={(e) => {
                      const value = (e.target as HTMLSelectElement).value;
                      onUpdateGroup(groupName, {
                        ...groupConfig,
                        formula: (value || undefined) as Formula | undefined,
                      });
                    }}
                  >
                    <option value="">inherit ({config.formula ?? 'wcag3'})</option>
                    <option value="wcag2">wcag2</option>
                    <option value="wcag3">wcag3</option>
                  </select>
                </label>
                <label>
                  ratios
                  <select
                    value={groupConfig.ratios ?? ''}
                    onChange={(e) => {
                      const value = (e.target as HTMLSelectElement).value;
                      onUpdateGroup(groupName, {
                        ...groupConfig,
                        ratios: value || undefined,
                      });
                    }}
                  >
                    <option value="">inherit (default)</option>
                    {scaleNamesFor(effectiveFormula).map((name) => (
                      <option value={name}>{labelFor(effectiveFormula, name)}</option>
                    ))}
                  </select>
                </label>
                <label>
                  export
                  <input
                    type="text"
                    value={(groupConfig.export ?? []).join(', ')}
                    placeholder="e.g. palette, default"
                    onChange={(e) => {
                      const groups = (e.target as HTMLInputElement).value
                        .split(',')
                        .map((entry) => entry.trim())
                        .filter(Boolean);
                      onUpdateGroup(groupName, {
                        ...groupConfig,
                        export: groups.length ? groups : undefined,
                      });
                    }}
                  />
                </label>
              </div>
            </div>
            <div class="group-members">
              {colors.map((color) => {
                // what the color would get from the group/root if it set nothing
                const inheritedRatios = groupConfig.ratios ?? 'default';
                const inheritedFormula = groupConfig.formula ?? config.formula ?? 'wcag3';
                const inheritedExport = groupConfig.export ?? [];
                // flag only real overrides: a per-color field whose value
                // differs from what it would inherit (a redundant field that
                // just restates the inherited value is not an override)
                const overrides = [
                  color.ratios !== undefined && color.ratios !== inheritedRatios
                    ? `ratios: ${color.ratios}`
                    : null,
                  color.formula !== undefined && color.formula !== inheritedFormula
                    ? `formula: ${color.formula}`
                    : null,
                  color.export !== undefined && color.export.join(',') !== inheritedExport.join(',')
                    ? `export: ${color.export.join(', ')}`
                    : null,
                ].filter(Boolean);
                const resolvedExport = color.export ?? groupConfig.export ?? [];
                const scales = preview?.get(color.name);
                return (
                  <div class="group-member">
                    <input
                      type="checkbox"
                      class="group-member-check"
                      checked={selected.has(color.name)}
                      title="select for batch export"
                      onChange={() => onToggleSelect(color.name)}
                    />
                    <span class="swatch" style={{ background: color.color }} />
                    <span class="group-member-name">
                      {color.name.split('.')[1]}
                      {overrides.length > 0 && (
                        <span class="badge" title={`overrides the group: ${overrides.join(', ')}`}>
                          override
                        </span>
                      )}
                    </span>
                    <span class="group-member-meta">
                      {resolveRatiosName(color, config)} - {resolveFormula(color, config)}
                      {resolvedExport.length > 0 && ` - ${resolvedExport.join(', ')}`}
                    </span>
                    {scales && (!onlySelectedScales || selected.has(color.name)) && (
                      <CompactRow steps={scales.light} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
