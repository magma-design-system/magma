import { useMemo, useState } from 'preact/hooks';
import type { ColorConfig, MagmaConfig } from '../../src/lib/color.mjs';
import { generateScales } from './generator.js';

interface BatchExportModalProps {
  /** colors that entered the batch (names), in config order */
  names: string[];
  config: MagmaConfig;
  /** prefilled export value (e.g. when opened from an existing export) */
  initialExport: string;
  onSave: (names: string[], exportList: string[] | undefined) => void;
  onExport: (names: string[]) => void;
  onClose: () => void;
}

/**
 * Batch editor for the export field of a hand-picked set of colors. Colors
 * can be unchecked to drop them from the operation; Save writes the export
 * to the checked ones, Export downloads only the checked selection.
 */
export function BatchExportModal({
  names,
  config,
  initialExport,
  onSave,
  onExport,
  onClose,
}: BatchExportModalProps) {
  const [checked, setChecked] = useState<Set<string>>(() => new Set(names));
  const [exportValue, setExportValue] = useState(initialExport);

  const colorsByName = useMemo(() => {
    const map = new Map<string, ColorConfig>();
    config.colors.forEach((color) => map.set(color.name, color));
    return map;
  }, [config]);

  // preview scales for just the picked colors; a bad config yields no scales
  const [scales, error] = useMemo((): [
    Map<string, ReturnType<typeof generateScales>> | null,
    string | null,
  ] => {
    try {
      const subset: MagmaConfig = {
        ...config,
        colors: names.map((n) => colorsByName.get(n)!).filter(Boolean),
      };
      return [generateScales(subset) as never, null];
    } catch (e) {
      return [null, e instanceof Error ? e.message : String(e)];
    }
  }, [JSON.stringify(config), names.join('|')]);

  const activeNames = names.filter((name) => checked.has(name));
  const exportList = exportValue
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const toggle = (name: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  return (
    <div class="modal-overlay">
      <div class="modal batch-modal">
        <h2>Batch export ({activeNames.length})</h2>
        {error && <div class="preview-error">{error}</div>}
        <div class="batch-list">
          {names.map((name) => {
            const color = colorsByName.get(name);
            const light = (scales as Map<string, { light: { value: string }[] }> | null)?.get(
              name,
            )?.light;
            return (
              <label class={`batch-row ${checked.has(name) ? '' : 'dropped'}`}>
                <input type="checkbox" checked={checked.has(name)} onChange={() => toggle(name)} />
                <span class="swatch" style={{ background: color?.color }} />
                <span class="batch-row-name">{name}</span>
                {light && (
                  <span class="batch-row-scale">
                    {light.map((step) => (
                      <span class="batch-swatch" style={{ background: step.value }} />
                    ))}
                  </span>
                )}
              </label>
            );
          })}
        </div>
        <label class="batch-export-field">
          export groups
          <input
            type="text"
            value={exportValue}
            placeholder="e.g. city, palette"
            onInput={(e) => setExportValue((e.target as HTMLInputElement).value)}
          />
        </label>
        <div class="modal-actions">
          <button onClick={onClose}>cancel</button>
          <button disabled={activeNames.length === 0} onClick={() => onExport(activeNames)}>
            export selection
          </button>
          <button
            class="primary"
            disabled={activeNames.length === 0}
            onClick={() => onSave(activeNames, exportList.length ? exportList : undefined)}
          >
            save export
          </button>
        </div>
      </div>
    </div>
  );
}
