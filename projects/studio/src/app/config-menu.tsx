/*
  The menu of the exit, in the bar (app/shell.tsx; the Config menu until #1402): the preset saved
  or downloaded is the action of the split button, and its menu holds the other ways out of the
  studio, the formats of today: the preset as JSON, the tokens, the Figma tokens, the CSS, a GIMP
  palette, the CSS of the themes (#1404), a copy of the JSON, the build on disk when a command serves the studio. What brings a
  preset in is the opening's (features/opening/, Import a preset). The actions are the
  state's (state/work.ts, state/exports.ts), each through the contrast gate before anything leaves,
  so the menu works from any page; the bar draws them, in the menu of its split button and in the
  menu of a narrow window. Each says beside its label the format of what it hands over, a badge
  the click goes through.
*/
import { useState } from 'preact/hooks';
import type { ExportKind } from '../engine/exports.js';
import { useT, msg } from '../shared/i18n/i18n.js';
import {
  copyConfig,
  downloadPreset,
  downloadThemesCss,
  exportConfig,
  guard,
} from '../state/exports.js';
import { useStudio } from '../state/studio.js';
import { buildTokens } from '../state/work.js';

/** An action of the menu: what it is called, what it reads or hands over, what it runs. */
export interface ConfigAction {
  id: string;
  /** What it is called, in English (msg): translated where it is drawn (#1336). */
  label: string;
  icon: string;
  /** The format of what the action reads or hands over: the badge beside its label. */
  format?: string;
  /** A separator before it: an action apart from the ones above it. */
  apart?: boolean;
  /** The menu stays open after it, so the person sees what it did (Copy JSON says Copied!). */
  keepOpen?: boolean;
  run: () => void;
}

const DOWNLOAD = 'mi/outline/file-download';

/** The downloads of the tokens: the action, what it hands over, its badge. */
const DOWNLOADS: Array<{ kind: Exclude<ExportKind, 'config'>; label: string; format: string }> = [
  // the badge says what is read or handed over: the file (json, css, gpl), the format of the
  // tokens (DTCG), misc for the zip of all of them (vittorio, 2026-11-09)
  { kind: 'zip', label: msg('Download all tokens'), format: 'misc' },
  { kind: 'figma', label: msg('Download Figma tokens'), format: 'DTCG' },
  { kind: 'css', label: msg('Download CSS tokens'), format: 'css' },
  { kind: 'gimp', label: msg('Download GIMP palette'), format: 'gpl' },
];

/** The actions of the menu of the exit on the state of the studio. */
export function useConfigMenu() {
  const studio = useStudio();
  const [copied, setCopied] = useState(false);
  const served = studio.served.value !== null;
  const copy = async () => {
    await copyConfig(studio);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const actions: ConfigAction[] = [
    // the preset itself: the action of the split button too, unless a command saves it
    {
      id: 'config',
      label: msg('Download the preset'),
      format: 'json',
      icon: DOWNLOAD,
      run: () => guard(studio, downloadPreset(studio)),
    },
    ...DOWNLOADS.map(({ kind, label, format }) => ({
      id: kind,
      label,
      format,
      icon: DOWNLOAD,
      run: () =>
        guard(studio, {
          label,
          proceed: msg('Download anyway'),
          run: () => exportConfig(studio, kind),
        }),
    })),
    // the themes as a theme file of styles takes them (#1404; Copy CSS of the Themes page until then)
    {
      id: 'themes',
      label: msg('Download the CSS of the themes'),
      format: 'css',
      icon: DOWNLOAD,
      run: () =>
        guard(studio, {
          label: msg('Download the CSS of the themes'),
          proceed: msg('Download anyway'),
          run: () => downloadThemesCss(studio),
        }),
    },
    {
      id: 'copy',
      label: copied ? msg('Copied!') : msg('Copy JSON'),
      icon: 'mi/baseline/content-copy',
      keepOpen: true,
      run: () => guard(studio, { label: msg('Copy JSON'), proceed: msg('Copy anyway'), run: copy }),
    },
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
  return actions;
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
      {actions.map((action, index) => (
        <>
          {action.apart && index > 0 && <mds-separator></mds-separator>}
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
