import { batch, computed, effect, signal, type ReadonlySignal, type Signal } from '@preact/signals';
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import bundledJson from '@maggioli-design-system/design-tokens/.magma-design-tokensrc.json';
import type { MagmaConfig } from '@maggioli-design-system/design-tokens/src/lib/color.mjs';
import { changesOf, type Change, type PresetState } from '../engine/changes.js';
import { gateReport, type GateReport, type GateVerdict } from '../engine/gate.js';
import { generateScales, type ColorScales } from '../engine/generator.js';
import { sceneStyle, type SceneStyle } from '../engine/scene-css.js';
import type { ThemeChoices } from '../engine/theme-choices.js';
import type { FileOut } from '../engine/exports.js';
import type { T, Vars } from '../shared/i18n/text.js';
import { workPlaceOf } from '../shared/routes/routes.js';
import {
  browserStorage,
  readDraft,
  writeDraft,
  type DraftReason,
  type DraftSource,
  type KeptIn,
  type LoadedRatios,
  type StudioDraft,
} from './draft.js';
import { readThemeChoices, writeThemeChoices } from './theme-choices.js';

/*
  The state of the studio (#1400): the work as signals, what is derived from it as computed
  values, the draft written by an effect. One state per studio mounted (createStudio): the shell
  makes it, or a host hands one in (#695), and the pages read it through StudioContext, so the
  work no longer lives in a page that must stay mounted to keep it. The actions that change it are
  named functions of this folder (palette.ts, scales.ts, surfaces.ts, groups.ts, work.ts,
  theme-choices.ts, exports.ts), each tested in Node.

  Imports go one way (README, Architecture): the state imports the engine and the texts
  (shared/i18n/text.ts), never a page, the shell or another part of shared.
*/

/** A configuration the studio edits: the schema of design-tokens, and what it does not name. */
export type CloneableConfig = MagmaConfig & Record<string, unknown>;

/**
 * A text of the state, in English (msg) with its places, translated where it is drawn, so it
 * follows the language the person picks after it was said; a place may hold another text. A
 * `plain` text is said as it is: what a server answered.
 */
export interface Text {
  text: string;
  vars?: Record<string, Vars[string] | Text>;
  plain?: boolean;
}

/** A text of the state in words, in the language of `t`. */
export function say(t: T, text: Text): string {
  if (text.plain) return text.text;
  if (!text.vars) return t(text.text);
  const vars = Object.fromEntries(
    Object.entries(text.vars).map(([key, value]) => [
      key,
      typeof value === 'object' ? say(t, value) : value,
    ]),
  );
  return t(text.text, vars);
}

/** The configuration a command serves (/api/config): where it is, and why it cannot be saved. */
export interface Served {
  path: string;
  /** Why the server refuses saves (a JavaScript config, package.json), or null. */
  readOnly: string | null;
}

/** The source changed under a draft with edits of its own: the person picks one. */
export interface DraftConflict {
  reason: DraftReason;
  /** The configuration of the source, taken when the person picks it. */
  config: CloneableConfig;
  /** What taking it is called, in English (msg). */
  label: string;
}

/**
 * Something that hands the configuration out of the studio: a download, a save, a copy. Its label
 * and the text of its button in the dialog of the gate are written in English and marked with
 * msg() where the action is made: the dialog translates them where it draws them. The button
 * carries its whole text, never a verb the dialog composes: one English word may be a verb and a
 * noun (Export), and the catalogue gives each English text one Italian.
 */
export interface ExportAction {
  /** What the action is called where the person chose it: `Download all tokens`. */
  label: string;
  /** The button of the dialog that runs the action anyway, repeating its verb: `Download anyway`. */
  proceed: string;
  run: () => void | Promise<void>;
}

/** The ramps of every family, solved by the generator, or why the configuration has none. */
export interface Generation {
  scales: Map<string, ColorScales> | null;
  error: string | null;
}

export interface StudioState {
  // the work
  /** The configuration edited. */
  config: Signal<CloneableConfig>;
  /**
   * The scales of the configuration last loaded, what the Reset of a scale takes it back to
   * (#1330): the one the studio opens with (the bundled one, or the file a command serves), the
   * one imported from the Config menu, the one the Reset of the page brings back. A save loads
   * nothing: what the person saves are edits of what was loaded.
   */
  loadedRatios: Signal<LoadedRatios>;
  /** The family selected, by its full name (`tone.neutral`). */
  selectedName: Signal<string>;
  /** The choices of the Themes page: names, accents, colour modes (engine/theme-choices.ts). */
  themeChoices: Signal<ThemeChoices>;
  /**
   * The address of the page of the work, a stage or a page beside one: the one of the draft, then
   * the last one opened (the shell writes it). The opening resumes the draft there.
   */
  workPlace: Signal<string | undefined>;
  /**
   * Names the studio gave a family during this session, after its colour: only these (and the
   * new-N placeholders) keep following the colour; a name the person typed is never touched.
   */
  autoNamed: Set<string>;

  // where it comes from
  /** The configuration the draft is made on, and its JSON; null until the start-up check ran. */
  origin: Signal<(DraftSource & { json: string }) | null>;
  /** The source changed under a draft with edits of its own, until the person picks one. */
  conflict: Signal<DraftConflict | null>;
  /** The command that serves the configuration, null on its own (the static site, a test). */
  served: Signal<Served | null>;
  /** The JSON of the configuration last saved; null when nothing has been saved yet. */
  savedJson: Signal<string | null>;
  /** A save is under way. */
  saving: Signal<boolean>;
  /** What the last save or build said, for a moment. */
  status: Signal<Text | null>;
  /** What kept the configuration from loading or being exported, or a warning on an edit. */
  notice: Signal<Text | null>;
  /** An export asked while the gate fails: the dialog of the gate asks first (exports.ts). */
  pendingExport: Signal<ExportAction | null>;
  /**
   * The preset at the last exit, as JSON (`presetJson`): what the changes of the bar are counted
   * from (#1402, the person chose the last exit on 2026-11-27). Opening a preset starts it from
   * that preset (adoptConfig), the exit brings it to the preset now (markExited); it is kept in the
   * draft, so a reload keeps the count.
   */
  baseline: Signal<string>;
  /**
   * The last preset the opening opened over work that had changes, and that work, for the toast
   * that undoes it (state/opening.ts, the act-then-undo of confirm-action); null once undone or
   * closed, or when nothing was lost.
   */
  lastOpening: Signal<Opening | null>;
  /**
   * An action that took work away and asked nothing (a family or a scale deleted, a scale taken
   * back to its built-in steps), while the toast that undoes it is open (state/undo.ts, the
   * act-then-undo of confirm-action); null once undone, closed, or once the preset changed again.
   */
  lastUndo: Signal<Undoable | null>;

  // derived
  /** The configuration as JSON: a change of its content, not of the object. */
  json: ReadonlySignal<string>;
  /** The contrast gate on the configuration and its themes (#698). */
  report: ReadonlySignal<GateReport>;
  verdict: ReadonlySignal<GateVerdict>;
  /** The palette and the themes as the frames paint them, null when the generator refuses. */
  scene: ReadonlySignal<SceneStyle | null>;
  /** The ramps of every family (the Groups page). */
  generation: ReadonlySignal<Generation>;
  /** Served by a command, with edits not saved. */
  dirty: ReadonlySignal<boolean>;
  /** What changed since the last exit, in the order of the stages (engine/changes.ts). */
  changes: ReadonlySignal<Change[]>;

  // what the state reaches outside
  /** Where the draft and the theme choices are kept. */
  storage: KeptIn;
  /** Whether a command may stand beside the page (/api/config). */
  api: boolean;
  /** Hands a file to the person. */
  download: (file: FileOut) => void;
  /** The draft restored at the start, before the start-up check decides on it. */
  boot: StudioDraft | null;
  /** Stops the effects: the draft and the choices are no longer written. */
  dispose: () => void;
}

/** The work as it stood, every part a preset is opened over: what undoing an opening restores. */
export interface WorkSnapshot {
  config: CloneableConfig;
  choices: ThemeChoices;
  baseline: string;
  selectedName: string;
  loadedRatios: LoadedRatios;
  workPlace: string | undefined;
}

/**
 * An action undone from a toast: what it said, the preset and the family selected before it, and
 * the preset it left (JSON), which an edit after it leaves behind.
 */
export interface Undoable {
  said: Text;
  before: CloneableConfig;
  selectedName: string;
  after: string;
}

/** A preset opened over work that had changes: what it said, and the work it took the place of. */
export interface Opening {
  /** What was opened, in English (msg) with its places, translated where it is drawn. */
  said: Text;
  previous: WorkSnapshot;
}

export interface StudioOptions {
  /** Where the work is kept: the storage of the browser by default. */
  storage?: KeptIn;
  /**
   * Whether a command may stand beside the page. The static site of the studio (site.ts, the site
   * on GitHub Pages) says in its pages that none does, `<meta name="magma-studio-api"
   * content="none">`: asking there would only log a 404, and editing stays in memory.
   */
  api?: boolean;
  /** How a file reaches the person: a download of the browser by default. */
  download?: (file: FileOut) => void;
}

/** The configuration Magma builds with, bundled: where the studio starts with no draft. */
export const bundled = (): CloneableConfig => clone(bundledJson as unknown as CloneableConfig);

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** The scales a configuration writes, a copy of its own that later edits leave alone. */
export const ratiosOf = (config: MagmaConfig): LoadedRatios =>
  clone((config.ratios ?? {}) as LoadedRatios);

/** The family selected first: neutral, the reference colour of the system, when present. */
export function defaultSelected(colors: MagmaConfig['colors']): string {
  return (
    colors.find((color) => color.name.split('.')[1] === 'neutral')?.name ?? colors[0]?.name ?? ''
  );
}

const pageSaysNoApi = (): boolean =>
  typeof document !== 'undefined' &&
  document.querySelector('meta[name="magma-studio-api"]')?.getAttribute('content') === 'none';

/** A download of the browser: a link to the file, clicked. */
export function downloadInBrowser({ name, data, type }: FileOut): void {
  const url = URL.createObjectURL(new Blob([data as BlobPart], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** The preset as the changes are counted on: the configuration and the choices of the themes. */
export const presetJson = (config: CloneableConfig, choices: ThemeChoices): string =>
  JSON.stringify({ config, choices } satisfies PresetState);

/**
 * A state of the studio: the draft kept in the storage restored, else the configuration Magma
 * builds with. The start-up check (checkSource, work.ts) then decides between the draft and its
 * source; the shell runs it once mounted.
 */
export function createStudio(options: StudioOptions = {}): StudioState {
  const storage = options.storage === undefined ? browserStorage() : options.storage;
  const boot = readDraft(storage);
  const start = boot ? boot.config : bundled();

  const config = signal<CloneableConfig>(start);
  const themeChoices = signal<ThemeChoices>(readThemeChoices(storage));
  const json = computed(() => JSON.stringify(config.value));
  const report = computed(() => gateReport(config.value, themeChoices.value));
  const served = signal<Served | null>(null);
  const savedJson = signal<string | null>(null);
  const baseline = signal(boot?.baseline ?? presetJson(start, themeChoices.peek()));
  const base = computed(() => JSON.parse(baseline.value) as PresetState);

  const state: StudioState = {
    config,
    loadedRatios: signal(boot?.loadedRatios ?? ratiosOf(bundled())),
    selectedName: signal(boot ? boot.selectedName : defaultSelected(start.colors)),
    themeChoices,
    workPlace: signal(workPlaceOf(boot?.view)),
    autoNamed: new Set(),
    origin: signal(null),
    conflict: signal(null),
    served,
    savedJson,
    saving: signal(false),
    status: signal(null),
    notice: signal(null),
    pendingExport: signal(null),
    baseline,
    lastOpening: signal(null),
    lastUndo: signal(null),
    json,
    report,
    verdict: computed(() => report.value.verdict),
    scene: computed(() => sceneStyle(config.value, themeChoices.value)),
    generation: computed(() => {
      try {
        return { scales: generateScales(config.value), error: null };
      } catch (error) {
        return { scales: null, error: String(error) };
      }
    }),
    dirty: computed(() => served.value !== null && json.value !== savedJson.value),
    changes: computed(() =>
      changesOf(base.value, { config: config.value, choices: themeChoices.value }),
    ),
    storage,
    api: options.api ?? !pageSaysNoApi(),
    download: options.download ?? downloadInBrowser,
    boot,
    dispose: () => undefined,
  };

  // the work mirrored to the storage at every change, stamped with the configuration it is made
  // on. Until the start-up check has run, and while a conflict waits for an answer, the restored
  // draft keeps its old stamp, so a reload asks again instead of keeping the draft silently
  const stopDraft = effect(() => {
    const origin = state.origin.value;
    if (!origin) return;
    const conflict = state.conflict.value;
    const draft = {
      config: state.config.value,
      selectedName: state.selectedName.value,
      view: state.workPlace.value ?? '#/colours',
      loadedRatios: state.loadedRatios.value,
      baseline: state.baseline.value,
    };
    if (conflict) {
      writeDraft({ ...draft, source: boot?.source, edited: true }, storage);
      return;
    }
    writeDraft(
      {
        ...draft,
        source: { path: origin.path, hash: origin.hash },
        edited: state.json.value !== origin.json,
      },
      storage,
    );
  });
  // the theme choices kept beside the draft, once the person changed them
  let first = true;
  const stopChoices = effect(() => {
    const choices = themeChoices.value;
    if (first) first = false;
    else writeThemeChoices(choices, storage);
  });
  // an undo holds while the preset is the one the action left: an edit after it closes the toast,
  // so Undo never takes back more than the action did
  const stopUndo = effect(() => {
    const undo = state.lastUndo.value;
    if (undo && state.json.value !== undo.after) state.lastUndo.value = null;
  });
  state.dispose = () => {
    stopDraft();
    stopChoices();
    stopUndo();
  };
  return state;
}

/**
 * Changes the configuration through a copy, the one the mutation writes on: the signal changes
 * only when the content does, so what is derived from it is not solved again for nothing (the
 * echo of a value the page set, a change that comes back to where it was).
 */
export function updateConfig(state: StudioState, mutate: (draft: CloneableConfig) => void): void {
  const draft = clone(state.config.peek());
  mutate(draft);
  if (JSON.stringify(draft) !== state.json.peek()) state.config.value = draft;
}

/**
 * Takes a whole configuration, which is now the one loaded (its scales are what the Reset of a
 * scale takes them back to). `keep` keeps the family selected when the configuration has it: a
 * source that replaces the draft; a configuration imported or reset opens on its first family.
 */
export function adoptConfig(state: StudioState, next: CloneableConfig, keep = false): void {
  batch(() => {
    state.config.value = next;
    state.loadedRatios.value = ratiosOf(next);
    // a preset opened: the changes are counted from it
    state.baseline.value = presetJson(next, state.themeChoices.peek());
    const name = state.selectedName.peek();
    if (!keep || !next.colors.some((color) => color.name === name))
      state.selectedName.value = defaultSelected(next.colors);
  });
}

/** The preset left the studio (saved or downloaded): the changes are counted from it now. */
export function markExited(state: StudioState): void {
  state.baseline.value = presetJson(state.config.peek(), state.themeChoices.peek());
}

/** The state of the studio the page is drawn in (the shell provides it). */
export const StudioContext = createContext<StudioState | null>(null);

/** The state of the studio, for a component drawn inside it. */
export function useStudio(): StudioState {
  const state = useContext(StudioContext);
  if (!state) throw new Error('A page of the studio is drawn outside a StudioContext.');
  return state;
}
