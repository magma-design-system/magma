import { useMemo, useRef, useState } from 'preact/hooks';
import initialConfigJson from '../../.magma-design-tokensrc.json';
import DEFAULT_COLOR_CONFIG from '../../src/config/default-color.json';
import type { ColorConfig, Formula, MagmaConfig } from '../../src/lib/color.mjs';
import { hasHueShift, resolveCurveWeights, type HueShiftConfig } from '../../src/lib/hue-shift.mjs';
import { generateScales, singleColorConfig, type ColorScales, type Step } from './generator.js';
import { ScalesManager, type RatioSet } from './scales.js';
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

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
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
  onChange: (patch: Partial<ColorConfig> | { hueShift: undefined }) => void;
  /** fired when the color picker is released (change, not live input) */
  onColorCommit: (hex: string) => void;
}

function ColorEditor({
  color,
  hasGlobalShift,
  scaleNames,
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
            value={color.ratios ?? 'default'}
            onChange={(e) => onChange({ ratios: (e.target as HTMLSelectElement).value })}
          >
            {scaleNames.map((preset) => (
              <option value={preset}>{preset}</option>
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
            <option value="">inherit</option>
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
            placeholder="e.g. tones, default"
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
  const [config, setConfig] = useState<CloneableConfig>(() =>
    clone(initialConfigJson as unknown as CloneableConfig),
  );
  const [selectedName, setSelectedName] = useState<string>(
    (initialConfigJson as unknown as MagmaConfig).colors[0]?.name ?? '',
  );
  const [view, setView] = useState<'editor' | 'grid' | 'scales'>('editor');
  const [copied, setCopied] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [scalesFormula, setScalesFormula] = useState<Formula>('wcag3');
  const [addModal, setAddModal] = useState<{
    color: string;
    name: string;
    group: string;
    manual: boolean;
  } | null>(null);

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
    if (!selected || view !== 'editor') return [null, null];
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

  const [gridScales, gridError] = useMemo((): [Map<string, ColorScales> | null, string | null] => {
    if (view !== 'grid') return [null, null];
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
    Object.keys(ratioSetFor((color.formula ?? config.formula ?? 'wcag3') as Formula));

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

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(config, null, 2) + '\n');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const loadConfigFile = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as CloneableConfig;
      if (!Array.isArray(parsed.colors) || parsed.colors.length === 0) {
        throw new Error('the file has no "colors" array');
      }
      setConfig(parsed);
      setSelectedName(parsed.colors[0].name);
      setView('editor');
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

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(config, null, 2) + '\n'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'magma-design-tokensrc.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div class="layout">
      <header class="topbar">
        <h1>
          magma design tokens <span>playground</span>
        </h1>
        <nav>
          <button class={view === 'editor' ? 'active' : ''} onClick={() => setView('editor')}>
            editor
          </button>
          <button class={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}>
            palette grid
          </button>
          <button class={view === 'scales' ? 'active' : ''} onClick={() => setView('scales')}>
            contrast scales
          </button>
        </nav>
        <div class="topbar-actions">
          <button
            onClick={() => {
              setConfig(clone(initialConfigJson as unknown as CloneableConfig));
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
          <button onClick={copyJson}>{copied ? 'copied!' : 'copy JSON'}</button>
          <button class="primary" onClick={downloadJson}>
            download config
          </button>
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
                  setView('editor');
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

      {addModal && (
        <div class="modal-overlay" onClick={() => setAddModal(null)}>
          <div class="modal" onClick={(e) => e.stopPropagation()}>
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
                  setView('editor');
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
        {view === 'editor' && selected && (
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
        {view === 'grid' && (
          <div class="grid">
            {gridError && <div class="preview-error">{gridError}</div>}
            {gridScales &&
              [...gridScales.entries()].map(([name, scales]) => (
                <div class="grid-item">
                  <h3>{name}</h3>
                  <div class="preview-card light compact">
                    <ScaleRow label="light" steps={scales.light} />
                  </div>
                  <div class="preview-card dark compact">
                    <ScaleRow label="dark" steps={scales.dark} />
                  </div>
                </div>
              ))}
          </div>
        )}
        {view === 'scales' && (
          <ScalesManager
            config={config}
            formula={scalesFormula}
            ratioSet={ratioSet}
            builtinScales={builtinScales}
            sampleScales={sampleScales}
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
                  if ((color.ratios ?? 'default') === name) color.ratios = nextName;
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
              // colors using the deleted scale fall back to the mandatory default
              updateConfig((draft) => {
                draft.colors.forEach((color) => {
                  const colorFormula = color.formula ?? draft.formula ?? 'wcag3';
                  if (colorFormula === scalesFormula && color.ratios === name) {
                    delete color.ratios;
                  }
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
      </main>
    </div>
  );
}
