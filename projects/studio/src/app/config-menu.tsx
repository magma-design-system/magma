/*
  The Config menu of the bar (shell.tsx): what brings a configuration into the studio and what
  takes it out, from any section (vittorio, 2026-11-09). The actions are the state's (#1400,
  state/work.ts, state/exports.ts), each through the contrast gate before anything leaves, so the
  menu works with no page of Colors mounted; the bar draws them, in its dropdown and in the menu
  of a narrow window. Each says beside its label the format of what it reads or hands over, a
  badge the click goes through.
*/
import { useRef, useState } from 'preact/hooks';
import type { ExportKind } from '../engine/exports.js';
import { useT, msg } from '../shared/i18n/i18n.js';
import { copyConfig, exportConfig, guard } from '../state/exports.js';
import { useStudio } from '../state/studio.js';
import { buildTokens, importConfig } from '../state/work.js';

/** An action of the Config menu: what it is called, what it reads or hands over, what it runs. */
export interface ConfigAction {
  id: string;
  /** What it is called, in English (msg): translated where it is drawn (#1336). */
  label: string;
  icon: string;
  /** The format of what the action reads or hands over: the badge beside its label. */
  format?: string;
  /** A separator before it: the actions that take the configuration out, after those that bring it in. */
  apart?: boolean;
  /** The menu stays open after it, so the person sees what it did (Copy JSON says Copied!). */
  keepOpen?: boolean;
  run: () => void;
}

const DOWNLOAD = 'mi/outline/file-download';

/** The downloads of the menu: the action, what it hands over, its badge. */
const DOWNLOADS: Array<{ kind: ExportKind; label: string; format: string }> = [
  // the badge says what is read or handed over: the file (json, css, gpl), the format of the
  // tokens (DTCG), misc for the zip of all of them (vittorio, 2026-11-09)
  { kind: 'zip', label: msg('Download all tokens'), format: 'misc' },
  { kind: 'config', label: msg('Download config'), format: 'json' },
  { kind: 'figma', label: msg('Download Figma tokens'), format: 'DTCG' },
  { kind: 'css', label: msg('Download CSS tokens'), format: 'css' },
  { kind: 'gimp', label: msg('Download GIMP palette'), format: 'gpl' },
];

/**
 * The actions of the Config menu on the state of the studio, and the picker of Import config,
 * drawn once beside them. `onImported` runs after a file is read: the pages of Colors show the
 * configuration loaded, or the notice of why it was not.
 */
export function useConfigMenu(onImported: (loaded: boolean) => void) {
  const studio = useStudio();
  const picker = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const served = studio.served.value !== null;
  const copy = async () => {
    await copyConfig(studio);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const actions: ConfigAction[] = [
    {
      id: 'import',
      label: msg('Import config'),
      format: 'json',
      icon: 'mi/baseline/upload-file',
      run: () => picker.current?.click(),
    },
    {
      id: 'copy',
      label: copied ? msg('Copied!') : msg('Copy JSON'),
      icon: 'mi/baseline/content-copy',
      keepOpen: true,
      run: () => guard(studio, { label: msg('Copy JSON'), proceed: msg('Copy anyway'), run: copy }),
    },
    ...DOWNLOADS.map(({ kind, label, format }, index) => ({
      id: kind,
      label,
      format,
      icon: DOWNLOAD,
      apart: index === 0,
      run: () =>
        guard(studio, {
          label,
          proceed: msg('Download anyway'),
          run: () => exportConfig(studio, kind),
        }),
    })),
    ...(served
      ? [
          {
            id: 'build',
            label: msg('Build tokens on disk'),
            icon: 'mi/baseline/build',
            apart: true,
            run: () =>
              guard(studio, {
                label: msg('Build tokens on disk'),
                proceed: msg('Build anyway'),
                run: () => buildTokens(studio),
              }),
          },
        ]
      : []),
  ];
  const input = (
    <input
      ref={picker}
      type="file"
      accept=".json,application/json"
      hidden
      onChange={async (event) => {
        const field = event.target as HTMLInputElement;
        const file = field.files?.[0];
        field.value = '';
        if (file) onImported(await importConfig(studio, file));
      }}
    />
  );
  return { actions, input };
}

/** The actions, a button each, its format in a badge over its end. */
export function ConfigItems({
  actions,
  onRun,
}: {
  actions: ConfigAction[];
  /** After an action ran, with it: the bar closes its menu, unless the action keeps it open. */
  onRun?: (action: ConfigAction) => void;
}) {
  const t = useT();
  return (
    <>
      {actions.map((action) => (
        <>
          {action.apart && <mds-separator></mds-separator>}
          <div class="studio-config-item">
            <mds-button
              type="button"
              variant="dark"
              tone="text"
              icon={action.icon}
              class="studio-menu-link"
              label={t(action.label)}
              aria-label={action.format ? `${t(action.label)}, ${action.format}` : undefined}
              data-action={action.id}
              onClick={() => {
                action.run();
                onRun?.(action);
              }}
            ></mds-button>
            {action.format && (
              <mds-badge variant="dark" label={action.format} aria-hidden="true"></mds-badge>
            )}
          </div>
        </>
      ))}
    </>
  );
}
