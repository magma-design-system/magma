import animationWords from '../../stencil/src/components/mds-pref-animation/meta/locale.en.json';
import consumptionWords from '../../stencil/src/components/mds-pref-consumption/meta/locale.en.json';
import contrastWords from '../../stencil/src/components/mds-pref-contrast/meta/locale.en.json';
import modeWords from '../../stencil/src/components/mds-pref-mode/meta/locale.en.json';

/*
  The preferences of the person the Theme section checks a theme under, the accessibility of the
  scene: the mode and the contrast, then the animations and the consumption (the language is no
  part of it, and the scene keeps its own). A dropdown of the bar holds their controls. The studio
  writes the mode and the contrast on the <html> of each frame itself (frame.ts, applyFrame), since
  two frames side by side show the two modes; it sets the other choices on the mds-pref-* of the
  scene (scene.html, `#studio-pref`, never shown), so Magma applies them on the document of the
  scene and leaves the studio alone (#695, "The dogfooding constraint"): the components themselves
  cannot sit in the dropdown, they would write on the document of the studio. The choices are the
  modes of each component with its English words (`meta/locale.en.json`, imported) and its icons;
  scene-prefs.test.mts holds the modes, their order and the defaults to the components.
*/

/** One mode of a preference: its value, the key of its word in the locale, its icon. */
export interface Choice<Mode extends string> {
  mode: Mode;
  word: string;
  icon: string;
}

export type AnimationMode = 'reduce' | 'system' | 'no-preference';
export type ConsumptionMode = 'low' | 'medium' | 'high';

/** The modes of mds-pref-animation (`meta/types.ts`), in the order it draws them. */
export const ANIMATIONS: ReadonlyArray<Choice<AnimationMode>> = [
  { mode: 'reduce', word: 'animationDisabled', icon: 'mi/outline/circle' },
  { mode: 'system', word: 'systemSettings', icon: 'mi/baseline/settings' },
  { mode: 'no-preference', word: 'animationEnabled', icon: 'mi/baseline/animation' },
];

/** The modes of mds-pref-consumption (`src/type/preference.ts`), in the order it draws them. */
export const CONSUMPTIONS: ReadonlyArray<Choice<ConsumptionMode>> = [
  { mode: 'low', word: 'consumptionLow', icon: 'mgg/consumption-low' },
  { mode: 'medium', word: 'consumptionMedium', icon: 'mgg/consumption-medium' },
  { mode: 'high', word: 'consumptionHigh', icon: 'mgg/consumption-high' },
];

/**
 * The modes a frame is seen in: those of mds-pref-mode (its `modes`), in the order it draws them,
 * without `system`, since the studio sets the mode of the frame; then the studio's own, both modes
 * side by side in two frames that scroll together.
 */
export type ModeView = 'light' | 'dark' | 'both';
export const MODES: ReadonlyArray<Choice<ModeView>> = [
  { mode: 'light', word: 'lightMode', icon: 'mi/baseline/light-mode' },
  { mode: 'dark', word: 'darkMode', icon: 'mi/baseline/dark-mode' },
  { mode: 'both', word: 'bothModes', icon: 'mi/baseline/compare' },
];
const MODE_WORDS: Record<string, string> = { ...modeWords, bothModes: 'Light and dark' };

/**
 * The modes of mds-pref-contrast (`meta/types.ts`), in the order it draws them, without `system`:
 * the studio sets the contrast of the frame.
 */
export type ContrastMode = 'more' | 'no-preference';
export const CONTRASTS: ReadonlyArray<Choice<ContrastMode>> = [
  { mode: 'more', word: 'contrastMore', icon: 'mi/baseline/contrast' },
  { mode: 'no-preference', word: 'contrastDefault', icon: 'mi/baseline/auto-awesome' },
];

export interface ScenePrefs {
  animation: AnimationMode;
  consumption: ConsumptionMode;
}

/**
 * What each component applies with nothing chosen: its `defaultMode`. The scene starts from it,
 * not from what the origin stored.
 */
export const DEFAULT_PREFS: ScenePrefs = {
  animation: 'system',
  consumption: 'high',
};

/**
 * Sets the preferences on the mds-pref-* of a scene: the attribute of each, which the component
 * turns into its prop and applies on the `<html>` of its own document. Written only when it
 * differs, as a component reflects what it applied at load (a mode the origin stored).
 */
export function applyPrefs(scene: Document, prefs: ScenePrefs) {
  const write = (tag: string, attribute: string, value: string) => {
    const element = scene.querySelector(tag);
    if (element && element.getAttribute(attribute) !== value)
      element.setAttribute(attribute, value);
  };
  write('mds-pref-animation', 'mode', prefs.animation);
  write('mds-pref-consumption', 'mode', prefs.consumption);
}

/**
 * A choice of modes, as an mds-pref-* draws it: its name and the word of the mode chosen, over the
 * tabs of the modes. A mode `off` names a reason for is drawn disabled, the reason as its title.
 */
export function Modes<Mode extends string>({
  words,
  choices,
  value,
  onValue,
  off,
}: {
  words: Record<string, string>;
  choices: ReadonlyArray<Choice<Mode>>;
  value: Mode;
  onValue: (mode: Mode) => void;
  off?: (mode: Mode) => string | undefined;
}) {
  const chosen = choices.find((one) => one.mode === value) ?? choices[0];
  return (
    <div class="studio-choice">
      <mds-text typography="caption" tag="p">
        <b>{words.label}</b> {words[chosen.word]}
      </mds-text>
      <mds-tab
        fill
        aria-label={words.label}
        onmdsTabChange={(event: CustomEvent<{ value?: string }>) => {
          const mode = choices.find((one) => one.mode === event.detail?.value)?.mode;
          if (mode) onValue(mode);
        }}
      >
        {choices.map((one) => (
          <mds-tab-item
            type="button"
            value={one.mode}
            icon={one.icon}
            title={off?.(one.mode) ?? words[one.word]}
            aria-label={words[one.word]}
            selected={one.mode === value}
            disabled={!!off?.(one.mode)}
          ></mds-tab-item>
        ))}
      </mds-tab>
    </div>
  );
}

/** The id of the title of the panel, which names the dropdown that holds it. */
export const PREFS_TITLE = 'studio-prefs-title';

/**
 * The panel of the dropdown: its title over a separator, then the controls of the preferences:
 * the mode and the contrast, which the shell writes on the frames, then the choices it sets on
 * their mds-pref-*, each handed back whole. The title is the one of a part (`h6`,
 * docs/agents/typography.md).
 */
export function ScenePrefsPanel({
  mode,
  onMode,
  modeOff,
  contrast,
  onContrast,
  prefs,
  onChange,
}: {
  mode: ModeView;
  onMode: (mode: ModeView) => void;
  modeOff: (mode: ModeView) => string | undefined;
  contrast: ContrastMode;
  onContrast: (contrast: ContrastMode) => void;
  prefs: ScenePrefs;
  onChange: (prefs: ScenePrefs) => void;
}) {
  return (
    <div class="studio-panel">
      <mds-text id={PREFS_TITLE} typography="h6" tag="h2">
        Accessibility
      </mds-text>
      <mds-separator></mds-separator>
      <Modes words={MODE_WORDS} choices={MODES} value={mode} onValue={onMode} off={modeOff} />
      <Modes words={contrastWords} choices={CONTRASTS} value={contrast} onValue={onContrast} />
      <Modes
        words={animationWords}
        choices={ANIMATIONS}
        value={prefs.animation}
        onValue={(animation) => onChange({ ...prefs, animation })}
      />
      <Modes
        words={consumptionWords}
        choices={CONSUMPTIONS}
        value={prefs.consumption}
        onValue={(consumption) => onChange({ ...prefs, consumption })}
      />
    </div>
  );
}
