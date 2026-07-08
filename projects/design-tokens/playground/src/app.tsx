import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import initialConfigJson from '../../.magma-design-tokensrc.json';
import DEFAULT_COLOR_CONFIG from '../../src/config/default-color.json';
import { zipSync } from 'fflate';
import type { ColorConfig, Formula, GroupConfig, MagmaConfig } from '../../src/lib/color.mjs';
import {
  createColorTokens,
  resolveExport,
  resolveFormula,
  resolveRatiosName,
} from '../../src/lib/color.mjs';
import { cssHex, cssRgb, gimpPalette } from './formats.js';
import { validateConfig } from '../../src/lib/schema.mjs';
import { colorsToDtcg, type ColorTokenTree } from '../../src/lib/dtcg.mjs';
import { GroupsManager } from './groups.js';
import { DiffView } from './diff.js';
import { BatchExportModal } from './batch.js';
import { hasHueShift, resolveCurveWeights, type HueShiftConfig } from '../../src/lib/hue-shift.mjs';
import { generateScales, singleColorConfig, type ColorScales, type Step } from './generator.js';
import { ScalesManager, type RatioSet, type ScaleOrigin } from './scales.js';
import { nearestColorName } from './color-names.js';
const COLORSPACES = [
  'HSL',
  'OKLCH',
  'LCH',
  'LAB',
  'OKLAB',
  'CAM02',
  'CAM02p',
  'HSLuv',
  'RGB',
  'HSV',
];
const CURVE_PRESETS = ['smooth', 'hard', 'custom'] as const;

type CloneableConfig = MagmaConfig & Record<string, unknown>;
type View = 'colors' | 'scales' | 'groups' | 'diff';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// the working state is mirrored to localStorage so a reload keeps the edited
// or loaded configuration instead of falling back to the defaults
const DRAFT_STORAGE_KEY = 'magma-design-tokens:playground:draft';

interface PlaygroundDraft {
  config: CloneableConfig;
  selectedName: string;
  view: View;
}

function readDraft(): PlaygroundDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as PlaygroundDraft;
    if (!draft.config || !Array.isArray(draft.config.colors) || draft.config.colors.length === 0) {
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

function writeDraft(draft: PlaygroundDraft): void {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // storage disabled or full: persistence is best-effort
  }
}

function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

// neutral is the reference color of the system: select it when present
function defaultSelected(colors: MagmaConfig['colors']): string {
  return (
    colors.find((color) => color.name.split('.')[1] === 'neutral')?.name ?? colors[0]?.name ?? ''
  );
}

function textColorFor(hex: string): string {
  try {
    const [r, g, b] = hex.match(/\w\w/g)!.map((c) => parseInt(c, 16) / 255);
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum > 0.45 ? '#00000099' : '#ffffff99';
  } catch {
    return '#00000099';
  }
}

function ScaleRow({ label, steps, seed }: { label: string; steps: Step[]; seed?: string }) {
  return (
    <div class="scale-row">
      <span class="scale-label">{label}</span>
      <div class="scale-cells">
        {steps.map((step) => (
          <div
            class="scale-cell"
            style={{ background: step.value }}
            title={`${step.value} - contrast ${step.contrast.toFixed(2)}:1`}
          >
            <span class="cell-contrast" style={{ color: textColorFor(step.value) }}>
              {step.contrast.toFixed(1)}
            </span>
            <span class="cell-hex" style={{ color: textColorFor(step.value) }}>
              {step.value.replace('#', '')}
            </span>
          </div>
        ))}
        {seed !== undefined && (
          <div class="scale-cell seed" style={{ background: seed }} title={`color token: ${seed}`}>
            <span class="cell-hex" style={{ color: textColorFor(seed) }}>
              seed
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function Preview({ scales, error }: { scales: ColorScales | null; error: string | null }) {
  if (error) return <div class="preview-error">{error}</div>;
  if (!scales) return null;
  return (
    <div class="preview">
      <div class="preview-card light">
        <ScaleRow label="light" steps={scales.light} seed={scales.lightColor} />
      </div>
      <div class="preview-card dark">
        <ScaleRow label="dark" steps={scales.dark} seed={scales.darkColor} />
      </div>
    </div>
  );
}

type HueShiftMode = 'inherit' | 'custom' | 'off';

interface HueShiftEditorProps {
  value: HueShiftConfig | undefined;
  onChange: (value: HueShiftConfig | undefined) => void;
  /**
   * Per-color editors allow inheriting the global hueShift; the global
   * editor itself only toggles between custom and off.
   */
  allowInherit?: boolean;
  globalActive?: boolean;
}

function HueShiftEditor({ value, onChange, allowInherit, globalActive }: HueShiftEditorProps) {
  const mode: HueShiftMode =
    value === undefined
      ? allowInherit
        ? 'inherit'
        : 'off'
      : (value.dark ?? 0) === 0 && (value.light ?? 0) === 0
        ? 'off'
        : 'custom';
  const enabled = mode === 'custom';
  const dark = value?.dark ?? 0;
  const light = value?.light ?? 0;
  const curve = value?.curve ?? 'smooth';
  const curveKind: (typeof CURVE_PRESETS)[number] =
    curve === 'smooth' || curve === 'hard' ? curve : 'custom';
  const deadZone =
    typeof curve === 'object' && !Array.isArray(curve) ? (curve.deadZone ?? 1 / 3) : 1 / 3;
  const easing =
    typeof curve === 'object' && !Array.isArray(curve) ? (curve.easing ?? 'linear') : 'linear';

  const weights = useMemo(() => {
    try {
      return resolveCurveWeights(curve as never, 10);
    } catch {
      return null;
    }
  }, [JSON.stringify(curve)]);

  const patch = (partial: Partial<HueShiftConfig>) => onChange({ dark, light, curve, ...partial });

  const setMode = (next: HueShiftMode) => {
    if (next === 'custom') onChange({ dark: -18, light: 10, curve: 'smooth' });
    else if (next === 'off') onChange(allowInherit ? { dark: 0, light: 0 } : undefined);
    else onChange(undefined);
  };

  return (
    <fieldset class="hue-shift">
      <legend>
        hue shifting
        <select
          value={mode}
          onChange={(e) => setMode((e.target as HTMLSelectElement).value as HueShiftMode)}
        >
          {allowInherit && (
            <option value="inherit">inherit global ({globalActive ? 'active' : 'off'})</option>
          )}
          <option value="custom">custom</option>
          <option value="off">off</option>
        </select>
      </legend>
      {enabled && (
        <>
          <label class="slider-row">
            <span>
              dark <code>{dark}deg</code>
            </span>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={dark}
              onInput={(e) => patch({ dark: Number((e.target as HTMLInputElement).value) })}
            />
          </label>
          <label class="slider-row">
            <span>
              light <code>{light}deg</code>
            </span>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={light}
              onInput={(e) => patch({ light: Number((e.target as HTMLInputElement).value) })}
            />
          </label>
          <div class="curve-controls">
            <label>
              curve
              <select
                value={curveKind}
                onChange={(e) => {
                  const kind = (e.target as HTMLSelectElement).value;
                  patch({
                    curve: kind === 'custom' ? { deadZone, easing } : (kind as 'smooth' | 'hard'),
                  });
                }}
              >
                {CURVE_PRESETS.map((preset) => (
                  <option value={preset}>{preset}</option>
                ))}
              </select>
            </label>
            {curveKind === 'custom' && (
              <>
                <label class="slider-row">
                  <span>
                    dead zone <code>{deadZone.toFixed(2)}</code>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={0.95}
                    step={0.05}
                    value={deadZone}
                    onInput={(e) =>
                      patch({
                        curve: { deadZone: Number((e.target as HTMLInputElement).value), easing },
                      })
                    }
                  />
                </label>
                <label>
                  easing
                  <select
                    value={easing}
                    onChange={(e) =>
                      patch({
                        curve: {
                          deadZone,
                          easing: (e.target as HTMLSelectElement).value as 'linear' | 'step',
                        },
                      })
                    }
                  >
                    <option value="linear">linear</option>
                    <option value="step">step</option>
                  </select>
                </label>
              </>
            )}
          </div>
          {weights && (
            <div class="weights" title="shift intensity per step (10-step scale)">
              {weights.map((weight) => (
                <div class="weight-bar">
                  <div class="weight-fill" style={{ height: `${Math.max(weight, 2)}%` }} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </fieldset>
  );
}

interface ColorEditorProps {
  color: ColorConfig;
  hasGlobalShift: boolean;
  scaleNames: string[];
  /** display label for a scale name (tags built-in-only scales) */
  labelFor: (name: string) => string;
  /** ratios scale the color resolves to when it does not override (group or default) */
  inheritedRatios: string;
  /** formula the color resolves to when it does not override (group or root) */
  inheritedFormula: string;
  /** export groups inherited from the group when the color does not set its own */
  inheritedExport: string[];
  onChange: (patch: Partial<ColorConfig> | { hueShift: undefined }) => void;
  /** fired when the color picker is released (change, not live input) */
  onColorCommit: (hex: string) => void;
}

function ColorEditor({
  color,
  hasGlobalShift,
  scaleNames,
  labelFor,
  inheritedRatios,
  inheritedFormula,
  inheritedExport,
  onChange,
  onColorCommit,
}: ColorEditorProps) {
  return (
    <div class="editor">
      <div class="editor-grid">
        <label>
          name
          <input
            type="text"
            value={color.name}
            onChange={(e) => onChange({ name: (e.target as HTMLInputElement).value })}
          />
        </label>
        <label>
          base color
          <span class="color-input">
            <input
              type="color"
              value={color.color}
              onInput={(e) =>
                onChange({ color: (e.target as HTMLInputElement).value as ColorConfig['color'] })
              }
              onChange={(e) => onColorCommit((e.target as HTMLInputElement).value)}
            />
            <code>{color.color}</code>
          </span>
        </label>
        <label>
          ratios
          <select
            value={color.ratios ?? ''}
            onChange={(e) =>
              onChange({ ratios: (e.target as HTMLSelectElement).value || undefined })
            }
          >
            <option value="">inherit ({inheritedRatios})</option>
            {scaleNames.map((preset) => (
              <option value={preset}>{labelFor(preset)}</option>
            ))}
          </select>
        </label>
        <label>
          formula
          <select
            value={color.formula ?? ''}
            onChange={(e) =>
              onChange({
                formula: ((e.target as HTMLSelectElement).value ||
                  undefined) as ColorConfig['formula'],
              })
            }
          >
            <option value="">inherit ({inheritedFormula})</option>
            <option value="wcag2">wcag2</option>
            <option value="wcag3">wcag3</option>
          </select>
        </label>
        <label>
          colorspace
          <select
            value={color.colorspace ?? ''}
            onChange={(e) =>
              onChange({
                colorspace: ((e.target as HTMLSelectElement).value ||
                  undefined) as ColorConfig['colorspace'],
              })
            }
          >
            <option value="">inherit</option>
            {COLORSPACES.map((space) => (
              <option value={space}>{space}</option>
            ))}
          </select>
        </label>
        <label>
          export groups
          <input
            type="text"
            value={(color.export ?? []).join(', ')}
            placeholder={
              inheritedExport.length
                ? `inherit (${inheritedExport.join(', ')})`
                : 'e.g. tones, default'
            }
            onChange={(e) => {
              const raw = (e.target as HTMLInputElement).value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
              onChange({ export: raw.length ? raw : undefined });
            }}
          />
        </label>
        <label class="checkbox">
          <input
            type="checkbox"
            checked={color.smooth ?? false}
            onChange={(e) =>
              onChange({ smooth: (e.target as HTMLInputElement).checked || undefined })
            }
          />
          smooth
        </label>
        <label class="checkbox">
          <input
            type="checkbox"
            checked={color.disabled ?? false}
            onChange={(e) =>
              onChange({ disabled: (e.target as HTMLInputElement).checked || undefined })
            }
          />
          disabled
        </label>
      </div>
      <HueShiftEditor
        value={color.hueShift}
        onChange={(hueShift) => onChange({ hueShift })}
        allowInherit
        globalActive={hasGlobalShift}
      />
    </div>
  );
}

export function App() {
  // a persisted working state, restored once at mount, takes precedence over
  // the bundled defaults
  const bootDraft = useMemo(() => readDraft(), []);
  const [config, setConfig] = useState<CloneableConfig>(() =>
    bootDraft ? bootDraft.config : clone(initialConfigJson as unknown as CloneableConfig),
  );
  const [selectedName, setSelectedName] = useState<string>(() =>
    bootDraft
      ? bootDraft.selectedName
      : defaultSelected((initialConfigJson as unknown as MagmaConfig).colors),
  );
  const [view, setView] = useState<View>(() => bootDraft?.view ?? 'colors');
  const [copied, setCopied] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  // server mode: the config is served by the `ui` command and can be saved
  // back to disk. When the playground runs standalone these stay inert.
  const [serverMode, setServerMode] = useState(false);
  const [savePath, setSavePath] = useState<string | null>(null);
  // JSON of the last-persisted config; null means nothing has been saved yet
  const [savedConfig, setSavedConfig] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [scalesFormula, setScalesFormula] = useState<Formula>('wcag3');
  const [addModal, setAddModal] = useState<{
    color: string;
    name: string;
    group: string;
    manual: boolean;
  } | null>(null);
  const [batchSelection, setBatchSelection] = useState<Set<string>>(() => new Set());
  const [batchModal, setBatchModal] = useState<{ names: string[]; initialExport: string } | null>(
    null,
  );

  const selectedIndex = config.colors.findIndex((c) => c.name === selectedName);
  const selected = selectedIndex >= 0 ? config.colors[selectedIndex] : undefined;

  const updateConfig = (mutate: (draft: CloneableConfig) => void) => {
    setConfig((prev) => {
      const draft = clone(prev);
      mutate(draft);
      return draft;
    });
  };

  const [selectedScales, selectedError] = useMemo((): [ColorScales | null, string | null] => {
    if (!selected || view !== 'colors') return [null, null];
    try {
      const scales = generateScales(singleColorConfig(config, selected));
      return [scales.get(selected.name) ?? null, null];
    } catch (error) {
      return [null, String(error)];
    }
  }, [
    JSON.stringify(selected),
    JSON.stringify(config.hueShift),
    JSON.stringify(config.ratios),
    config.colorspace,
    config.smooth,
    config.formula,
    view,
  ]);

  const [fullScales, fullScalesError] = useMemo((): [
    Map<string, ColorScales> | null,
    string | null,
  ] => {
    if (view !== 'groups') return [null, null];
    try {
      return [generateScales(config), null];
    } catch (error) {
      return [null, String(error)];
    }
  }, [view, JSON.stringify(config)]);

  const groups = useMemo(() => {
    const map = new Map<string, ColorConfig[]>();
    config.colors.forEach((color) => {
      const group = color.name.split('.')[0];
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(color);
    });
    return map;
  }, [config]);

  // effective ratio scales: config entries layered over the built-in ones,
  // exactly like the generator merges them. A null entry in the config is
  // the sentinel for a deleted built-in scale and is filtered out.
  const ratioSetFor = (formula: Formula): RatioSet =>
    Object.fromEntries(
      Object.entries({
        ...(DEFAULT_COLOR_CONFIG.ratios as Record<Formula, RatioSet>)[formula],
        ...(config.ratios?.[formula] ?? {}),
      }).filter(([, values]) => Array.isArray(values)),
    );
  const ratioSet = ratioSetFor(scalesFormula);
  const builtinScales = Object.keys(
    (DEFAULT_COLOR_CONFIG.ratios as Record<Formula, RatioSet>)[scalesFormula],
  );

  const scaleNamesFor = (color: ColorConfig): string[] =>
    Object.keys(ratioSetFor(resolveFormula(color, config)));

  // origin of a scale relative to the built-in defaults. Comparing stops
  // (rather than mere presence in config.ratios) keeps the tag correct even
  // though writeScale materializes untouched built-ins back into the config.
  const scaleOrigin = (formula: Formula, name: string): ScaleOrigin => {
    const builtin = (DEFAULT_COLOR_CONFIG.ratios as Record<Formula, RatioSet>)[formula]?.[name];
    if (!Array.isArray(builtin)) return 'custom';
    const current = ratioSetFor(formula)[name];
    const overridden =
      !!current &&
      (current.length !== builtin.length || current.some((value, i) => value !== builtin[i]));
    return overridden ? 'builtin-overridden' : 'builtin';
  };
  const scaleLabel = (formula: Formula, name: string): string => {
    const origin = scaleOrigin(formula, name);
    if (origin === 'builtin') return `${name} (built-in)`;
    if (origin === 'builtin-overridden') return `${name} (built-in, overridden)`;
    return name;
  };

  const writeScale = (mutate: (draftSet: RatioSet) => void) => {
    updateConfig((draft) => {
      const materialized = {
        ...(DEFAULT_COLOR_CONFIG.ratios as Record<Formula, RatioSet>)[scalesFormula],
        ...(draft.ratios?.[scalesFormula] ?? {}),
      };
      mutate(materialized);
      draft.ratios = {
        ...(draft.ratios ?? {}),
        [scalesFormula]: materialized,
      } as MagmaConfig['ratios'];
    });
  };

  const sampleScales = useMemo(() => {
    const map = new Map<string, string[]>();
    if (view !== 'scales' || !selected) return map;
    Object.keys(ratioSet).forEach((name) => {
      try {
        const sampleColor: ColorConfig = {
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

  // mirror the working state to localStorage on every change
  useEffect(() => {
    writeDraft({ config, selectedName, view });
  }, [JSON.stringify(config), selectedName, view]);

  // when served by the `ui` command, adopt the on-disk config and enable saving
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/config');
        if (!res.ok) return;
        const data = (await res.json()) as { path: string; config: CloneableConfig | null };
        if (cancelled) return;
        setServerMode(true);
        setSavePath(data.path);
        if (data.config && Array.isArray(data.config.colors) && data.config.colors.length > 0) {
          const loaded = data.config;
          // the on-disk file is always the save baseline; only adopt it as the
          // working config when there is no restored draft to keep
          setSavedConfig(JSON.stringify(loaded));
          if (!bootDraft) {
            setConfig(loaded);
            setSelectedName(defaultSelected(loaded.colors));
          }
        } else {
          // no config file on disk yet: the bundled default is unsaved
          setSavedConfig(null);
        }
      } catch {
        // not served by the ui command; the standalone playground keeps defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const dirty = serverMode && JSON.stringify(config) !== savedConfig;

  // reset returns to the built-in default: it only does something when the
  // current config differs from it (edited or loaded), so disable it otherwise
  const defaultConfigString = useMemo(() => JSON.stringify(initialConfigJson), []);
  const canReset = JSON.stringify(config) !== defaultConfigString;

  const saveConfig = async () => {
    if (!serverMode || saving) return;
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(config, null, 2) + '\n',
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? `save failed (${res.status})`);
      }
      setSavedConfig(JSON.stringify(config));
      setStatusMsg('saved');
      setTimeout(() => setStatusMsg((msg) => (msg === 'saved' ? null : msg)), 1500);
    } catch (error) {
      setStatusMsg(error instanceof Error ? error.message : 'save failed');
    } finally {
      setSaving(false);
    }
  };

  const buildTokens = async () => {
    setStatusMsg('building...');
    try {
      const res = await fetch('/api/build', { method: 'POST' });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? `build failed (${res.status})`);
      setStatusMsg('tokens generated on disk');
      setTimeout(
        () => setStatusMsg((msg) => (msg === 'tokens generated on disk' ? null : msg)),
        2000,
      );
    } catch (error) {
      setStatusMsg(error instanceof Error ? error.message : 'build failed');
    }
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(config, null, 2) + '\n');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const loadConfigFile = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as CloneableConfig;
      const { valid, errors } = validateConfig(parsed);
      if (!valid) {
        throw new Error(errors.slice(0, 3).join('; ') || 'it does not match the schema');
      }
      setConfig(parsed);
      setSelectedName(defaultSelected(parsed.colors));
      setView('colors');
      setLoadError(null);
    } catch (error) {
      setLoadError(
        `Could not load ${file.name}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  // names assigned by the system during this session: only these (and the
  // new-N placeholders) keep following the picker; a name typed by the
  // user is never touched
  const autoNamedRef = useRef(new Set<string>());

  // when the color picker is released, colors still carrying an
  // auto-assigned name get renamed after the picked value, unique within
  // the config; a duplicate hex only raises a warning
  const autoNameColor = (index: number, hex: string) => {
    const color = config.colors[index];
    if (!color) return;
    const duplicate = config.colors.find(
      (other, i) => i !== index && other.color.toLowerCase() === hex.toLowerCase(),
    );
    setLoadError(duplicate ? `Warning: ${hex} is already used by "${duplicate.name}"` : null);

    const [group, baseName] = color.name.split('.');
    const autoAssigned =
      /^new(-\d+)?$/.test(baseName ?? '') || autoNamedRef.current.has(color.name);
    if (!autoAssigned) return;
    const vocabularyName = nearestColorName(hex);
    let candidate = vocabularyName;
    let suffix = 2;
    while (
      config.colors.some((other, i) => i !== index && other.name === `${group}.${candidate}`)
    ) {
      candidate = `${vocabularyName}-${suffix}`;
      suffix += 1;
    }
    const nextName = `${group}.${candidate}`;
    if (nextName === color.name) return;
    autoNamedRef.current.delete(color.name);
    autoNamedRef.current.add(nextName);
    updateConfig((draft) => {
      draft.colors[index].name = nextName;
    });
    setSelectedName(nextName);
  };

  const triggerDownload = (data: BlobPart, filename: string, type: string) => {
    const url = URL.createObjectURL(new Blob([data], { type }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadJson = () =>
    triggerDownload(
      JSON.stringify(config, null, 2) + '\n',
      'magma-design-tokensrc.json',
      'application/json',
    );

  type ColorTree = Parameters<typeof cssHex>[0];

  // The whole palette plus one entry per export group; formats that respect
  // export diversification (CSS, GIMP) emit one file per entry. The whole
  // palette carries an empty suffix, groups carry "-<group>".
  const exportTrees = (
    tokens: ColorTree,
    exportGroups: Record<string, unknown>,
  ): Array<{ suffix: string; tree: ColorTree }> => [
    { suffix: '', tree: tokens },
    ...Object.keys(exportGroups).map((group) => ({
      suffix: `-${group}`,
      tree: exportGroups[group] as ColorTree,
    })),
  ];

  const cssFiles = (
    tokens: ColorTree,
    exportGroups: Record<string, unknown>,
    date: string,
  ): Record<string, string> => {
    const files: Record<string, string> = {};
    exportTrees(tokens, exportGroups).forEach(({ suffix, tree }) => {
      files[`colors-hex${suffix}.css`] = cssHex(tree, date);
      files[`colors-rgb${suffix}.css`] = cssRgb(tree, date);
    });
    return files;
  };

  const gimpFiles = (
    tokens: ColorTree,
    exportGroups: Record<string, unknown>,
  ): Record<string, string> => {
    const files: Record<string, string> = {};
    exportTrees(tokens, exportGroups).forEach(({ suffix, tree }) => {
      // the whole palette keeps the classic name, groups take the group name
      files[`${suffix ? suffix.slice(1) : 'colors'}.gpl`] = gimpPalette(tree);
    });
    return files;
  };

  // download a set of text files: a single file directly, several as a zip
  const downloadFiles = (files: Record<string, string>, zipName: string, singleType: string) => {
    const names = Object.keys(files);
    if (names.length === 1) {
      triggerDownload(files[names[0]], names[0], singleType);
      return;
    }
    const encoder = new TextEncoder();
    const zipped: Record<string, Uint8Array> = {};
    names.forEach((name) => {
      zipped[name] = encoder.encode(files[name]);
    });
    triggerDownload(zipSync(zipped), zipName, 'application/zip');
  };

  const downloadCss = () => {
    try {
      const { tokens, exportGroups } = createColorTokens(clone(config));
      downloadFiles(
        cssFiles(tokens as ColorTree, exportGroups, new Date().toUTCString()),
        'magma-css.zip',
        'text/css',
      );
      setLoadError(null);
    } catch (error) {
      setLoadError(
        `Could not build the CSS: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  const downloadGimp = () => {
    try {
      const { tokens, exportGroups } = createColorTokens(clone(config));
      downloadFiles(gimpFiles(tokens as ColorTree, exportGroups), 'magma-gimp.zip', 'text/plain');
      setLoadError(null);
    } catch (error) {
      setLoadError(
        `Could not build the palette: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  // DTCG color tokens for Figma: one file per theme mode, zipped together.
  // Matches the package build output (dist/json/figma-magma-colors-*.tokens.json).
  const downloadFigmaDtcg = () => {
    try {
      const { tokens } = createColorTokens(clone(config));
      const color = (tokens as ColorTree).color as unknown as ColorTokenTree;
      downloadFiles(
        {
          'figma-magma-colors-light.tokens.json':
            JSON.stringify(colorsToDtcg(color, 'light'), null, 2) + '\n',
          'figma-magma-colors-dark.tokens.json':
            JSON.stringify(colorsToDtcg(color, 'dark'), null, 2) + '\n',
        },
        'magma-figma-dtcg.zip',
        'application/json',
      );
      setLoadError(null);
    } catch (error) {
      setLoadError(
        `Could not build the Figma tokens: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  // zip mirroring the dist output: the config, the generated JSON tokens
  // (whole palette + one file per export group, byte-for-byte the CLI files)
  // and the CSS / GIMP renders, both diversified per export group
  const downloadZip = () => {
    try {
      const { tokens, exportGroups } = createColorTokens(clone(config));
      const date = new Date().toUTCString();
      const files: Record<string, Uint8Array> = {};
      const encoder = new TextEncoder();
      const add = (path: string, text: string) => {
        files[path] = encoder.encode(text);
      };
      add('magma-design-tokensrc.json', JSON.stringify(config, null, 2) + '\n');
      // token JSON files match the generator output byte-for-byte (no newline)
      add('tokens/color/generated/base.json', JSON.stringify(tokens, null, 2));
      Object.keys(exportGroups).forEach((group) => {
        add(`tokens/color/generated/${group}.json`, JSON.stringify(exportGroups[group], null, 2));
      });
      const css = cssFiles(tokens as ColorTree, exportGroups, date);
      Object.keys(css).forEach((name) => add(`css/${name}`, css[name]));
      const gimp = gimpFiles(tokens as ColorTree, exportGroups);
      Object.keys(gimp).forEach((name) => add(`gimp/${name}`, gimp[name]));
      triggerDownload(zipSync(files), 'magma-design-tokens.zip', 'application/zip');
      setLoadError(null);
    } catch (error) {
      setLoadError(
        `Could not build the zip: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  const toggleBatch = (name: string) =>
    setBatchSelection((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  // color names in config order, for a stable modal list
  const namesInOrder = (predicate: (color: ColorConfig) => boolean): string[] =>
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
    const target = new Set(names);
    updateConfig((draft) => {
      draft.colors.forEach((color) => {
        if (!target.has(color.name)) return;
        if (exportList) color.export = exportList;
        else delete color.export;
      });
    });
    setBatchModal(null);
    setBatchSelection(new Set());
  };

  // download a zip with the generated tokens of only the selected colors
  const exportSelection = (names: string[]) => {
    try {
      const target = new Set(names);
      const subset: CloneableConfig = {
        ...clone(config),
        colors: config.colors.filter((color) => target.has(color.name)),
      };
      const { tokens, exportGroups } = createColorTokens(subset);
      const date = new Date().toUTCString();
      const files: Record<string, Uint8Array> = {};
      const encoder = new TextEncoder();
      const add = (path: string, text: string) => {
        files[path] = encoder.encode(text);
      };
      add('tokens/color/generated/base.json', JSON.stringify(tokens, null, 2));
      const css = cssFiles(tokens as ColorTree, exportGroups, date);
      Object.keys(css).forEach((name) => add(`css/${name}`, css[name]));
      const gimp = gimpFiles(tokens as ColorTree, exportGroups);
      Object.keys(gimp).forEach((name) => add(`gimp/${name}`, gimp[name]));
      triggerDownload(zipSync(files), 'magma-selection.zip', 'application/zip');
      setLoadError(null);
    } catch (error) {
      setLoadError(
        `Could not export the selection: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  // every export name referenced by the config, for the select-by-export control
  const allExportNames = [
    ...new Set(config.colors.flatMap((color) => resolveExport(color, config) ?? [])),
  ].sort();

  return (
    <div class="layout">
      <header class="topbar">
        <h1>
          magma design tokens <span>playground</span>
        </h1>
        <nav>
          <button class={view === 'colors' ? 'active' : ''} onClick={() => setView('colors')}>
            colors
          </button>
          <button class={view === 'scales' ? 'active' : ''} onClick={() => setView('scales')}>
            contrast scales
          </button>
          <button class={view === 'groups' ? 'active' : ''} onClick={() => setView('groups')}>
            groups
          </button>
          <button class={view === 'diff' ? 'active' : ''} onClick={() => setView('diff')}>
            diff
          </button>
        </nav>
        <div class="topbar-actions">
          <button
            title="discard the loaded config and any local changes, back to the built-in default"
            disabled={!canReset}
            onClick={() => {
              clearDraft();
              const base = clone(initialConfigJson as unknown as CloneableConfig);
              setConfig(base);
              setSelectedName(defaultSelected(base.colors));
              setView('colors');
              setLoadError(null);
            }}
          >
            reset
          </button>
          <label class="file-button">
            load config
            <input
              type="file"
              accept=".json,application/json"
              onChange={(e) => {
                const input = e.target as HTMLInputElement;
                const file = input.files?.[0];
                if (file) loadConfigFile(file);
                input.value = '';
              }}
            />
          </label>
          {statusMsg && <span class="save-status">{statusMsg}</span>}
          {serverMode ? (
            <button
              class="primary"
              onClick={saveConfig}
              disabled={saving || !dirty}
              title={savePath ?? undefined}
            >
              {saving ? 'saving...' : dirty ? 'save *' : 'saved'}
            </button>
          ) : (
            <button onClick={copyJson}>{copied ? 'copied!' : 'copy JSON'}</button>
          )}
          <div class="download-menu">
            <button onClick={() => setDownloadOpen((open) => !open)}>download {'▾'}</button>
            {downloadOpen && (
              <>
                <div class="download-backdrop" onClick={() => setDownloadOpen(false)} />
                <ul class="download-list">
                  {[
                    { label: 'All tokens (zip)', run: downloadZip },
                    { label: 'Figma tokens (DTCG)', run: downloadFigmaDtcg },
                    { label: 'Config (json)', run: downloadJson },
                    { label: 'CSS tokens', run: downloadCss },
                    { label: 'GIMP palette', run: downloadGimp },
                    ...(serverMode ? [{ label: 'Build tokens on disk', run: buildTokens }] : []),
                  ].map((item) => (
                    <li>
                      <button
                        onClick={() => {
                          setDownloadOpen(false);
                          item.run();
                        }}
                      >
                        {item.label}
                        {item.soon && <span class="badge">soon</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </header>

      {loadError && <div class="load-error">{loadError}</div>}

      <aside class="sidebar">
        {[...groups.entries()].map(([group, colors]) => (
          <div class="group">
            <h2>{group}</h2>
            {colors.map((color) => (
              <button
                class={`color-item ${color.name === selectedName ? 'active' : ''} ${color.disabled ? 'disabled' : ''}`}
                onClick={() => {
                  setSelectedName(color.name);
                  // the scales view works on the selected color: switching
                  // color must not leave it
                  if (view !== 'scales') setView('colors');
                }}
              >
                <span class="swatch" style={{ background: color.color }} />
                {color.name.split('.')[1]}
                {hasHueShift(color.hueShift ?? config.hueShift) && (
                  <span class="badge" title="hue shifting active">
                    hs
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
        <div class="sidebar-actions">
          <button
            onClick={() =>
              setAddModal({
                color: '#4f8fd9',
                name: nearestColorName('#4f8fd9'),
                group: 'label',
                manual: false,
              })
            }
          >
            + add color
          </button>
        </div>
      </aside>

      {/* the dialog has no click-outside dismissal: an accidental click must not lose the input */}
      {addModal && (
        <div class="modal-overlay">
          <div class="modal">
            <h2>New color</h2>
            <input
              class="modal-picker"
              type="color"
              value={addModal.color}
              onInput={(e) => {
                const hex = (e.target as HTMLInputElement).value;
                setAddModal(
                  (state) =>
                    state && {
                      ...state,
                      color: hex,
                      name: state.manual ? state.name : nearestColorName(hex),
                    },
                );
              }}
            />
            <div class="modal-fields">
              <label>
                group
                <select
                  value={addModal.group}
                  onChange={(e) =>
                    setAddModal(
                      (state) =>
                        state && { ...state, group: (e.target as HTMLSelectElement).value },
                    )
                  }
                >
                  {[...new Set([...groups.keys(), 'label'])].map((group) => (
                    <option value={group}>{group}</option>
                  ))}
                </select>
              </label>
              <label>
                name
                <input
                  type="text"
                  value={addModal.name}
                  onInput={(e) =>
                    setAddModal(
                      (state) =>
                        state && {
                          ...state,
                          name: (e.target as HTMLInputElement).value,
                          manual: true,
                        },
                    )
                  }
                />
              </label>
            </div>
            <p class="modal-preview">
              <span class="swatch" style={{ background: addModal.color }} />
              <code>
                {addModal.group}.{addModal.name}
              </code>
              <code>{addModal.color}</code>
            </p>
            <div class="modal-actions">
              <button onClick={() => setAddModal(null)}>cancel</button>
              <button
                class="primary"
                disabled={!addModal.name.trim()}
                onClick={() => {
                  const base = addModal.name.trim();
                  let candidate = base;
                  let suffix = 2;
                  while (config.colors.some((c) => c.name === `${addModal.group}.${candidate}`)) {
                    candidate = `${base}-${suffix}`;
                    suffix += 1;
                  }
                  const fullName = `${addModal.group}.${candidate}`;
                  if (!addModal.manual) autoNamedRef.current.add(fullName);
                  updateConfig((draft) => {
                    draft.colors.push({
                      color: addModal.color,
                      name: fullName,
                    } as ColorConfig);
                  });
                  setSelectedName(fullName);
                  setView('colors');
                  setAddModal(null);
                }}
              >
                add color
              </button>
            </div>
          </div>
        </div>
      )}

      <main class="content">
        {view === 'colors' && selected && (
          <>
            <div class="content-head">
              <h2>{selected.name}</h2>
              <div class="content-head-actions">
                <button
                  onClick={() =>
                    updateConfig((draft) => {
                      const source = draft.colors[selectedIndex];
                      const copy = clone(source);
                      copy.name = `${source.name}-copy`;
                      draft.colors.splice(selectedIndex + 1, 0, copy);
                      setSelectedName(copy.name);
                    })
                  }
                >
                  duplicate
                </button>
                <button
                  class="danger"
                  onClick={() =>
                    updateConfig((draft) => {
                      draft.colors.splice(selectedIndex, 1);
                      setSelectedName(draft.colors[0]?.name ?? '');
                    })
                  }
                >
                  delete
                </button>
              </div>
            </div>
            <Preview scales={selectedScales} error={selectedError} />
            <ColorEditor
              color={selected}
              hasGlobalShift={config.hueShift !== undefined}
              scaleNames={scaleNamesFor(selected)}
              labelFor={(name) => scaleLabel(resolveFormula(selected, config), name)}
              inheritedRatios={resolveRatiosName({ ...selected, ratios: undefined }, config)}
              inheritedFormula={resolveFormula({ ...selected, formula: undefined }, config)}
              inheritedExport={config.groups?.[selected.name.split('.')[0]]?.export ?? []}
              onColorCommit={(hex) => autoNameColor(selectedIndex, hex)}
              onChange={(patch) => {
                // a name typed by the user opts the color out of auto-naming
                if ('name' in patch) autoNamedRef.current.delete(selected.name);
                updateConfig((draft) => {
                  const target = draft.colors[selectedIndex] as Record<string, unknown>;
                  Object.entries(patch).forEach(([key, value]) => {
                    if (value === undefined) delete target[key];
                    else target[key] = value;
                  });
                  if ('name' in patch && typeof patch.name === 'string')
                    setSelectedName(patch.name);
                });
              }}
            />
            <details class="global-settings" open>
              <summary>global settings</summary>
              <div class="editor-grid">
                <label>
                  colorspace
                  <select
                    value={config.colorspace ?? 'HSL'}
                    onChange={(e) =>
                      updateConfig((draft) => {
                        draft.colorspace = (e.target as HTMLSelectElement).value;
                      })
                    }
                  >
                    {COLORSPACES.map((space) => (
                      <option value={space}>{space}</option>
                    ))}
                  </select>
                </label>
                <label class="checkbox">
                  <input
                    type="checkbox"
                    checked={config.smooth ?? false}
                    onChange={(e) =>
                      updateConfig((draft) => {
                        draft.smooth = (e.target as HTMLInputElement).checked;
                      })
                    }
                  />
                  smooth
                </label>
              </div>
              <HueShiftEditor
                value={config.hueShift}
                onChange={(hueShift) =>
                  updateConfig((draft) => {
                    if (hueShift === undefined) delete (draft as Record<string, unknown>).hueShift;
                    else draft.hueShift = hueShift;
                  })
                }
              />
            </details>
          </>
        )}
        {view === 'scales' && (
          <ScalesManager
            config={config}
            formula={scalesFormula}
            ratioSet={ratioSet}
            builtinScales={builtinScales}
            sampleScales={sampleScales}
            selectedName={selectedName}
            labelFor={(name) => scaleLabel(scalesFormula, name)}
            originFor={(name) => scaleOrigin(scalesFormula, name)}
            onSelectColor={setSelectedName}
            onFormulaChange={setScalesFormula}
            onChangeScale={(name, values) =>
              writeScale((draftSet) => {
                draftSet[name] = values;
              })
            }
            onRenameScale={(name, nextName) => {
              if (!nextName || nextName === name || ratioSet[nextName]) return;
              writeScale((draftSet) => {
                draftSet[nextName] = draftSet[name];
                delete draftSet[name];
              });
              updateConfig((draft) => {
                draft.colors.forEach((color) => {
                  if (color.ratios === name) color.ratios = nextName;
                });
                Object.values(draft.groups ?? {}).forEach((group) => {
                  if (group.ratios === name) group.ratios = nextName;
                });
              });
            }}
            onAddScale={(copyFrom) => {
              let index = 1;
              while (ratioSet[`custom-${index}`]) index += 1;
              writeScale((draftSet) => {
                draftSet[`custom-${index}`] = [...(draftSet[copyFrom] ?? draftSet.default)];
              });
            }}
            onDeleteScale={(name) => {
              // colors and groups using the deleted scale fall back to the
              // mandatory default
              updateConfig((draft) => {
                draft.colors.forEach((color) => {
                  const colorFormula = color.formula ?? draft.formula ?? 'wcag3';
                  if (colorFormula === scalesFormula && color.ratios === name) {
                    delete color.ratios;
                  }
                });
                Object.values(draft.groups ?? {}).forEach((group) => {
                  if (group.ratios === name) delete group.ratios;
                });
              });
              writeScale((draftSet) => {
                if (builtinScales.includes(name)) {
                  // built-ins are merged back by the generator: a null entry
                  // in the config marks them as deleted
                  (draftSet as Record<string, unknown>)[name] = null;
                } else {
                  delete draftSet[name];
                }
              });
            }}
          />
        )}
        {view === 'groups' && (
          <GroupsManager
            config={config}
            groups={groups}
            scaleNamesFor={(formula) => Object.keys(ratioSetFor(formula))}
            labelFor={scaleLabel}
            preview={fullScales}
            previewError={fullScalesError}
            onUpdateGroup={(groupName, patch) =>
              updateConfig((draft) => {
                const cleaned: GroupConfig = {};
                if (patch.ratios !== undefined) cleaned.ratios = patch.ratios;
                if (patch.formula !== undefined) cleaned.formula = patch.formula;
                if (patch.export !== undefined) cleaned.export = patch.export;
                const nextGroups = { ...(draft.groups ?? {}) };
                if (Object.keys(cleaned).length === 0) delete nextGroups[groupName];
                else nextGroups[groupName] = cleaned;
                if (Object.keys(nextGroups).length === 0)
                  delete (draft as Record<string, unknown>).groups;
                else draft.groups = nextGroups;
              })
            }
            selected={batchSelection}
            onToggleSelect={toggleBatch}
            exportNames={allExportNames}
            onSelectByExport={selectByExport}
            onOpenBatch={openBatch}
          />
        )}
        {view === 'diff' && <DiffView config={config} />}
      </main>

      {batchModal && (
        <BatchExportModal
          names={batchModal.names}
          config={config}
          initialExport={batchModal.initialExport}
          onSave={saveBatch}
          onExport={exportSelection}
          onClose={() => setBatchModal(null)}
        />
      )}
    </div>
  );
}
