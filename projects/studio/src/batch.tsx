import { useMemo, useState } from 'preact/hooks';
import type {
  ColorConfig,
  MagmaConfig,
} from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { generateScales } from './generator.js';
import { useT } from './i18n.js';
import { Check, Field, TextInput } from './magma.js';
import './batch.css';

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
  const t = useT();
  const [checked, setChecked] = useState<Set<string>>(() => new Set(names));
  const [exportValue, setExportValue] = useState(initialExport);

  const colorsByName = useMemo(() => {
    const map = new Map<string, ColorConfig>();
    config.colors.forEach((color) => map.set(color.name, color));
    return map;
  }, [config]);

  // preview scales for just the picked colors; a bad config yields no scales
  const [scales, error] = useMemo((): [ReturnType<typeof generateScales> | null, string | null] => {
    try {
      const subset: MagmaConfig = {
        ...config,
        colors: names.map((n) => colorsByName.get(n)!).filter(Boolean),
      };
      return [generateScales(subset), null];
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

  const title = t('Batch export ({count})', { count: activeNames.length });
  return (
    <mds-modal opened aria-label={title} onmdsModalClose={onClose}>
      <mds-banner
        slot="window"
        variant="light"
        tone="box"
        dismissible
        headline={title}
        onmdsBannerClose={onClose}
      >
        <div class="studio-dialog">
          {error && <mds-banner variant="error">{error}</mds-banner>}
          <div class="batch-list" role="group" aria-label={t('The colors of the batch')}>
            {names.map((name) => {
              const color = colorsByName.get(name);
              const light = scales?.get(name)?.light;
              return (
                <div class={`batch-row ${checked.has(name) ? '' : 'dropped'}`}>
                  <Check checked={checked.has(name)} onChecked={() => toggle(name)}>
                    <span class="batch-row-name">
                      <span class="studio-swatch" style={{ background: color?.color }} />
                      {name}
                    </span>
                  </Check>
                  {light && (
                    <span class="batch-row-scale">
                      {light.map((step) => (
                        <span class="batch-swatch" style={{ background: step.value }} />
                      ))}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <Field label={t('Export groups')} message={t('Comma-separated, e.g. city, palette')}>
            <TextInput value={exportValue} onValue={setExportValue} />
          </Field>
        </div>
        <mds-button
          slot="action"
          type="button"
          variant="dark"
          tone="outline"
          label={t('Cancel')}
          onClick={onClose}
        ></mds-button>
        <mds-button
          slot="action"
          type="button"
          variant="dark"
          tone="outline"
          disabled={activeNames.length === 0}
          label={t('Export selection')}
          onClick={() => onExport(activeNames)}
        ></mds-button>
        <mds-button
          slot="action"
          type="button"
          disabled={activeNames.length === 0}
          label={t('Save export')}
          onClick={() => onSave(activeNames, exportList.length ? exportList : undefined)}
        ></mds-button>
      </mds-banner>
    </mds-modal>
  );
}
