import { useEffect, useState } from 'preact/hooks';
import type {
  ColorConfig,
  Formula,
  GroupConfig,
  MagmaConfig,
} from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import {
  resolveFormula,
  resolveRatiosName,
} from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import type { ColorScales, Step } from './generator.js';
import { Check, Field, Select, TextInput } from './magma.js';
import './groups.css';

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

/** The export field of a group as the person writes it: comma-separated names. */
const parseExport = (text: string): string[] =>
  text
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

const plural = (count: number, noun: string): string => `${count} ${noun}${count === 1 ? '' : 's'}`;

// the light ramp of a colour: data, so each step keeps its own colour inline
function Ramp({ steps }: { steps: Step[] }) {
  return (
    <span class="groups-ramp">
      {steps.map((step) => (
        <span
          class="groups-ramp-step"
          style={{ background: step.value }}
          title={`${step.value} - ${step.contrast.toFixed(2)}:1`}
        />
      ))}
    </span>
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
  // when on, selected colors are lifted into a dedicated section on top so
  // they can be compared side by side; the rest stay grouped below
  const [groupSelected, setGroupSelected] = useState(false);
  // the export picked in "Select by export": it acts once, then the select goes back to its
  // placeholder, so the same export can be picked again. The reset is a render of its own, after
  // the one that took the pick: a value equal to the last one rendered never reaches the
  // component, which would keep showing the pick.
  const [exportPick, setExportPick] = useState('');
  useEffect(() => {
    if (exportPick) setExportPick('');
  }, [exportPick]);
  // the export of a group, from the field that commits on Enter or on leaving it (TextInput,
  // commit "leave"): a list parsed at every key would lose the comma just typed
  const commitExport = (groupName: string, groupConfig: GroupConfig, text: string) => {
    const list = parseExport(text);
    if (list.join(',') === (groupConfig.export ?? []).join(',')) return;
    onUpdateGroup(groupName, { ...groupConfig, export: list.length ? list : undefined });
  };

  // one color row: checkbox with the swatch and the name (+ override badge), meta and its
  // light scale. Shared by the group cards and the Selected section.
  const renderMember = (color: ColorConfig) => {
    const memberGroup = color.name.split('.')[0];
    const groupConfig = config.groups?.[memberGroup] ?? {};
    // what the color would get from the group/root if it set nothing
    const inheritedRatios = groupConfig.ratios ?? 'default';
    const inheritedFormula = groupConfig.formula ?? config.formula ?? 'wcag3';
    const inheritedExport = groupConfig.export ?? [];
    // flag only real overrides: a per-color field whose value differs from
    // what it would inherit (a redundant field restating it is not an override)
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
    // keyed by the name: mds-input-switch reads its accessible name ("Select porcelain") from
    // its text once, so its element must never pass from one colour to another
    return (
      <div class="groups-member" key={color.name}>
        <span class="groups-member-check">
          <Check checked={selected.has(color.name)} onChecked={() => onToggleSelect(color.name)}>
            <span class="groups-member-name">
              <span class="studio-swatch" style={{ background: color.color }} />
              {color.name.split('.')[1]}
            </span>
          </Check>
          {overrides.length > 0 && (
            <mds-badge
              label="override"
              variant="info"
              tone="weak"
              title={`overrides the group: ${overrides.join(', ')}`}
            />
          )}
        </span>
        <mds-text typography="caption" tag="p" class="groups-member-meta studio-muted">
          {resolveRatiosName(color, config)} - {resolveFormula(color, config)}
          {resolvedExport.length > 0 && ` - ${resolvedExport.join(', ')}`}
        </mds-text>
        {scales && <Ramp steps={scales.light} />}
      </div>
    );
  };

  // selected colors across every group, in group then config order
  const selectedColors = [...groups.values()].flat().filter((color) => selected.has(color.name));

  return (
    <div class="groups-page">
      <mds-text typography="detail" tag="p" class="groups-hint studio-muted">
        Ratios, formula and export are managed per token group here (the <code>groups</code> section
        of the configuration). Tick colors across groups to set their export together, or pick an
        existing export to load every color that uses it. Group selected lifts the ticked colors
        into a section on top, to compare them.
      </mds-text>
      {/* the selection of the batch (docs/agents/patterns/item-list.md, "selection"): how many,
          then the batch action; the view of the selection and the selection by export follow */}
      <div class="groups-selection">
        <div class="groups-selection-bar">
          <mds-text typography="detail" tag="p" role="status">
            {selected.size} selected
          </mds-text>
          <mds-button
            type="button"
            variant="primary"
            tone="outline"
            disabled={selected.size === 0}
            onClick={onOpenBatch}
          >
            Batch export
          </mds-button>
          <Check type="switch" checked={groupSelected} onChecked={setGroupSelected}>
            Group selected
          </Check>
        </div>
        <span class="groups-selection-export">
          <Field label="Select by export">
            <Select
              size="md"
              value={exportPick}
              placeholder="Choose an export"
              options={exportNames.map((name) => ({ value: name, label: name }))}
              onValue={(value) => {
                setExportPick(value);
                if (value) onSelectByExport(value);
              }}
            />
          </Field>
        </span>
      </div>
      {previewError && <mds-banner variant="error">{previewError}</mds-banner>}
      {groupSelected && selectedColors.length > 0 && (
        <mds-card class="groups-card">
          <mds-card-header>
            <span class="groups-card-title">
              <mds-text typography="part" tag="h2">
                Selected
              </mds-text>
              <mds-text typography="detail" tag="p" class="studio-muted">
                {plural(selectedColors.length, 'color')}
              </mds-text>
            </span>
          </mds-card-header>
          <mds-card-content>
            <div class="groups-members">{selectedColors.map(renderMember)}</div>
          </mds-card-content>
        </mds-card>
      )}
      {[...groups.entries()].map(([groupName, colors]) => {
        const groupConfig = config.groups?.[groupName] ?? {};
        const effectiveFormula = groupConfig.formula ?? ((config.formula ?? 'wcag3') as Formula);
        // when grouping, the selected colors are shown in the section above
        const members = groupSelected ? colors.filter((c) => !selected.has(c.name)) : colors;
        return (
          <mds-card class="groups-card" key={groupName}>
            <mds-card-header>
              <span class="groups-card-title">
                <mds-text typography="part" tag="h2">
                  {groupName}
                </mds-text>
                <mds-text typography="detail" tag="p" class="studio-muted">
                  {plural(colors.length, 'color')}
                </mds-text>
              </span>
            </mds-card-header>
            <mds-card-content>
              <div class="groups-settings">
                <Field label="Formula">
                  <Select
                    size="md"
                    value={groupConfig.formula ?? ''}
                    options={[
                      { value: '', label: `inherit (${config.formula ?? 'wcag3'})` },
                      { value: 'wcag2', label: 'wcag2' },
                      { value: 'wcag3', label: 'wcag3' },
                    ]}
                    onValue={(value) =>
                      onUpdateGroup(groupName, {
                        ...groupConfig,
                        formula: (value || undefined) as Formula | undefined,
                      })
                    }
                  />
                </Field>
                <Field label="Ratios">
                  <Select
                    size="md"
                    value={groupConfig.ratios ?? ''}
                    options={[
                      { value: '', label: 'inherit (default)' },
                      ...scaleNamesFor(effectiveFormula).map((name) => ({
                        value: name,
                        label: labelFor(effectiveFormula, name),
                      })),
                    ]}
                    onValue={(value) =>
                      onUpdateGroup(groupName, { ...groupConfig, ratios: value || undefined })
                    }
                  />
                </Field>
                <div class="groups-settings-export">
                  <Field label="Export">
                    <TextInput
                      size="md"
                      commit="leave"
                      value={(groupConfig.export ?? []).join(', ')}
                      placeholder="e.g. palette, default"
                      onValue={(text) => commitExport(groupName, groupConfig, text)}
                    />
                  </Field>
                </div>
              </div>
              <div class="groups-members">
                {members.length > 0 ? (
                  members.map(renderMember)
                ) : (
                  <mds-text typography="detail" tag="p" class="studio-muted">
                    All the colors of the group are in the Selected section.
                  </mds-text>
                )}
              </div>
            </mds-card-content>
          </mds-card>
        );
      })}
    </div>
  );
}
