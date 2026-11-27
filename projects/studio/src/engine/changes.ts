import { msg } from '../shared/i18n/text.js';
import type { ThemeChoices } from './theme-choices.js';

/*
  The changes of the work (#1402): what differs between the preset at the last exit and the
  preset now, one line per value, each in the stage that changes it (studio.object-model.md,
  section 4, Change: what changed, in which stage, before and after). The bar of the studio counts
  them and lists them by stage (app/shell.tsx); the state keeps the preset of the last exit
  (state/studio.ts, `baseline`). The last exit, not the configuration Magma builds with: the person
  chose so on 2026-11-27, so a save or a download brings the count back to none, and opening a
  preset starts it from that preset.

  Where each part of the preset is changed, read from the object model (section 5) and the pages
  of today that do the work of each stage (shared/routes/routes.ts, STAGES):
  - Colours: the families (`colors`), the contrast scales (`ratios`, the page Scale beside it), the
    groups (`groups`, the page Group beside it) and the settings of the whole preset (colorspace,
    smooth, formula, saturation, hue shift: the settings under the families of the Palette today,
    question 13 of the object model);
  - Weights: the `theme` block of the configuration, the surfaces, the borders, the text;
  - Themes: the choices of the Themes page, the name, the accents and the modes of each theme,
    kept beside the configuration until it keeps the themes itself (#694).
  A key of the configuration this file does not know is a change of the preset, in Colours, with
  its key as its name: an unknown key is never dropped from the count.

  Pure: no Preact, no state, no document.
*/

/** The stages a change belongs to: ids of the stages of the flow (shared/routes/routes.ts). */
export type ChangeStage = 'colours' | 'weights' | 'themes';

/** A family of the configuration, as this file reads it: a name, and values read as a record. */
interface Family {
  name: string;
}

/** The preset as the studio keeps it: the configuration, and the choices of the themes. */
export interface PresetState {
  config: { colors: Family[]; [key: string]: unknown };
  choices: ThemeChoices;
}

/** A value before or after, as the line says it. */
export interface Said {
  /** The value: as written in the preset, or a word in English (msg) when `word`. */
  text: string;
  /** A word of the studio (`yes`, `no`), translated where it is drawn. */
  word?: boolean;
}

/** One change of the preset. */
export interface Change {
  stage: ChangeStage;
  /**
   * What changed: a family by its name, else a text in English (msg) with its places, the name of
   * a scale, a group, a role or a theme in `vars`.
   */
  subject: {
    text: string;
    vars?: Record<string, string | { text: string; plain?: boolean }>;
    plain?: boolean;
  };
  /** Added, removed, or one of its values changed. */
  kind: 'added' | 'removed' | 'changed';
  /** The value that changed, its name in English (msg), or the key of the preset as written. */
  field?: { text: string; plain?: boolean };
  /** The value before and after, when it can be said in a few words. */
  before?: Said;
  after?: Said;
}

/** The names of the values of a family, a group and the preset, as the pages of Colors name them. */
const FIELDS: Record<string, string> = {
  color: msg('Base colour'),
  ratios: msg('Contrast scale'),
  colorspace: msg('Colorspace'),
  saturation: msg('Saturation'),
  hueShift: msg('Hue shift'),
  formula: msg('Formula'),
  smooth: msg('Smooth'),
  export: msg('Export'),
  alias: msg('Reference'),
  surface: msg('Surfaces'),
};

/** The keys of the configuration read by a part of its own below. */
const READ_APART = new Set(['colors', 'ratios', 'groups', 'theme']);

const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

/** The values of a family, by key. */
const recordOf = (family: Family): Record<string, unknown> => ({ ...family });
/** The key of a family that names it, not a value of it. */
const NAME: ReadonlySet<string> = new Set(['name']);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** A value in a few words: a text, a number, a yes or no, a short list; nothing for the rest. */
function sayValue(value: unknown): Said | undefined {
  if (typeof value === 'string') return { text: value };
  if (typeof value === 'number') return { text: String(value) };
  if (typeof value === 'boolean') return { text: value ? msg('yes') : msg('no'), word: true };
  if (
    Array.isArray(value) &&
    value.length <= 12 &&
    value.every((one) => typeof one === 'string' || typeof one === 'number')
  )
    return { text: value.join(', ') };
  return undefined;
}

const fieldOf = (key: string): Change['field'] =>
  FIELDS[key] ? { text: FIELDS[key] } : { text: key, plain: true };

/** The values of two records that differ, one change each. */
function changedValues(
  stage: ChangeStage,
  subject: Change['subject'],
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  skip: ReadonlySet<string> = new Set(),
): Change[] {
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(
    (key) => !skip.has(key),
  );
  return keys
    .filter((key) => !same(before[key], after[key]))
    .map((key) => ({
      stage,
      subject,
      kind: 'changed' as const,
      field: fieldOf(key),
      before: sayValue(before[key]),
      after: sayValue(after[key]),
    }));
}

/** The families: added, removed, or their values changed; in the order of the preset now. */
function familyChanges(before: Family[], after: Family[]): Change[] {
  const was = new Map(before.map((family) => [family.name, family]));
  const now = new Map(after.map((family) => [family.name, family]));
  const changes: Change[] = [];
  for (const family of after) {
    const subject = { text: family.name, plain: true };
    const old = was.get(family.name);
    if (!old) changes.push({ stage: 'colours', subject, kind: 'added' });
    else changes.push(...changedValues('colours', subject, recordOf(old), recordOf(family), NAME));
  }
  for (const family of before)
    if (!now.has(family.name))
      changes.push({
        stage: 'colours',
        subject: { text: family.name, plain: true },
        kind: 'removed',
      });
  return changes;
}

/** Named records (the scales of a formula, the groups): added, removed, or their values changed. */
function namedChanges(
  subjectOf: (name: string) => Change['subject'],
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): Change[] {
  const changes: Change[] = [];
  for (const name of [...new Set([...Object.keys(before), ...Object.keys(after)])]) {
    const subject = subjectOf(name);
    const [old, now] = [before[name], after[name]];
    if (same(old, now)) continue;
    // a scale the preset deletes is written null (state/scales.ts): it is removed
    if (old === undefined || old === null)
      changes.push({ stage: 'colours', subject, kind: 'added' });
    else if (now === undefined || now === null)
      changes.push({ stage: 'colours', subject, kind: 'removed' });
    else if (isRecord(old) && isRecord(now))
      changes.push(...changedValues('colours', subject, old, now));
    else
      changes.push({
        stage: 'colours',
        subject,
        kind: 'changed',
        before: sayValue(old),
        after: sayValue(now),
      });
  }
  return changes;
}

/** The scales of each formula (`ratios`), by name. */
function scaleChanges(before: unknown, after: unknown): Change[] {
  const [was, now] = [isRecord(before) ? before : {}, isRecord(after) ? after : {}];
  return [...new Set([...Object.keys(was), ...Object.keys(now)])].flatMap((formula) =>
    namedChanges(
      (name) => ({ text: msg('scale {name}'), vars: { name } }),
      isRecord(was[formula]) ? was[formula] : {},
      isRecord(now[formula]) ? now[formula] : {},
    ),
  );
}

/** The roles of the weights, each a leaf of the `theme` block: `surfaces.light.raised`. */
function leavesOf(value: unknown, path: string[] = []): Map<string, unknown> {
  const leaves = new Map<string, unknown>();
  if (isRecord(value))
    for (const [key, child] of Object.entries(value))
      for (const [leaf, at] of leavesOf(child, [...path, key])) leaves.set(leaf, at);
  else if (path.length) leaves.set(path.join('.'), value);
  return leaves;
}

/** The modes of the weights, as words of the studio. */
const MODE_WORDS: Record<string, string> = { light: msg('light'), dark: msg('dark') };

/** How the weights name a role: `surface-raised, light`, as its token is named. */
function roleOf(path: string): Change['subject'] {
  const [part, ...rest] = path.split('.');
  const kinds: Record<string, string> = { surfaces: 'surface', borders: 'border', text: 'text' };
  if (kinds[part] && rest.length === 2)
    return {
      text: msg('{role}, {mode}'),
      vars: {
        role: `${kinds[part]}-${rest[1]}`,
        mode: MODE_WORDS[rest[0]] ? { text: MODE_WORDS[rest[0]] } : { text: rest[0], plain: true },
      },
    };
  if (kinds[part] && rest.length === 1) return { text: `${kinds[part]}-${rest[0]}`, plain: true };
  return { text: path, plain: true };
}

/** The weights: one change per value of the `theme` block. */
function weightChanges(before: unknown, after: unknown): Change[] {
  const [was, now] = [leavesOf(before), leavesOf(after)];
  return [...new Set([...was.keys(), ...now.keys()])]
    .filter((path) => !same(was.get(path), now.get(path)))
    .map((path) => ({
      stage: 'weights' as const,
      subject: roleOf(path),
      kind: 'changed' as const,
      before: sayValue(was.get(path)),
      after: sayValue(now.get(path)),
    }));
}

/** The choices of the themes: the name, each accent and the modes of the theme of a family. */
function themeChanges(before: ThemeChoices, after: ThemeChoices): Change[] {
  const families = [
    ...new Set(
      [before, after].flatMap((choices) => [
        ...Object.keys(choices.names),
        ...Object.keys(choices.accents),
        ...Object.keys(choices.modes),
      ]),
    ),
  ];
  const changes: Change[] = [];
  for (const family of families) {
    const subject = { text: msg('theme of {family}'), vars: { family } };
    const line = (field: Change['field'], old: unknown, now: unknown) => {
      if (!same(old, now))
        changes.push({
          stage: 'themes',
          subject,
          kind: 'changed',
          field,
          before: sayValue(old),
          after: sayValue(now),
        });
    };
    line({ text: msg('Name') }, before.names[family], after.names[family]);
    const roles = new Set([
      ...Object.keys(before.accents[family] ?? {}),
      ...Object.keys(after.accents[family] ?? {}),
    ]);
    for (const role of roles)
      line(
        { text: role, plain: true },
        before.accents[family]?.[role],
        after.accents[family]?.[role],
      );
    line({ text: msg('Modes') }, before.modes[family], after.modes[family]);
  }
  return changes;
}

const STAGE_ORDER: readonly ChangeStage[] = ['colours', 'weights', 'themes'];

/**
 * The changes from one preset to another, in the order of the stages, then in the order of the
 * preset: the families, the scales, the groups, the settings of the preset, the weights, the
 * themes.
 */
export function changesOf(before: PresetState, after: PresetState): Change[] {
  const [was, now] = [before.config, after.config];
  const settings = (config: PresetState['config']) =>
    Object.fromEntries(Object.entries(config).filter(([key]) => !READ_APART.has(key)));
  // the settings of the whole preset, and any key of it this file does not know, in Colours
  const preset = changedValues(
    'colours',
    { text: msg('the preset') },
    settings(was),
    settings(now),
  );
  const changes = [
    ...familyChanges(was.colors ?? [], now.colors ?? []),
    ...scaleChanges(was.ratios, now.ratios),
    ...namedChanges(
      (name) => ({ text: msg('group {name}'), vars: { name } }),
      isRecord(was.groups) ? was.groups : {},
      isRecord(now.groups) ? now.groups : {},
    ),
    ...preset,
    ...weightChanges(was.theme, now.theme),
    ...themeChanges(before.choices, after.choices),
  ];
  return STAGE_ORDER.flatMap((stage) => changes.filter((change) => change.stage === stage));
}
