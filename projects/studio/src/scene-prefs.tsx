import animationWords from '../../stencil/src/components/mds-pref-animation/meta/locale.en.json';
import consumptionWords from '../../stencil/src/components/mds-pref-consumption/meta/locale.en.json';

/*
  The preferences of the person the Theme section checks a theme under, beside the mode and the
  contrast of its header: the animations and the consumption, the accessibility of the scene (the
  language is no part of it, and the scene keeps its own). A dropdown of the bar
  holds their controls, and the studio sets each choice on the mds-pref-* of the scene
  (scene.html, `#studio-pref`, never shown), so Magma applies it on the document of the scene and
  leaves the studio alone (#695, "The dogfooding constraint"): the components themselves cannot sit
  in the dropdown, they would write on the document of the studio. The choices are the modes of
  each component with its English words (`meta/locale.en.json`, imported) and its icons;
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

/** A preference of modes: its name and the word of the mode chosen, over the tabs of the modes. */
function Modes<Mode extends string>({
  words,
  choices,
  value,
  onValue,
}: {
  words: Record<string, string>;
  choices: ReadonlyArray<Choice<Mode>>;
  value: Mode;
  onValue: (mode: Mode) => void;
}) {
  const chosen = choices.find((one) => one.mode === value) ?? choices[0];
  return (
    <div class="studio-pref">
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
            title={words[one.word]}
            aria-label={words[one.word]}
            selected={one.mode === value}
          ></mds-tab-item>
        ))}
      </mds-tab>
    </div>
  );
}

/** The id of the title of the panel, which names the dropdown that holds it. */
export const PREFS_TITLE = 'studio-prefs-title';

/**
 * The panel of the dropdown: its title over a separator, then the controls of the preferences,
 * each choice handed back whole. The title is the one of a part (`h6`, docs/agents/typography.md).
 */
export function ScenePrefsPanel({
  prefs,
  onChange,
}: {
  prefs: ScenePrefs;
  onChange: (prefs: ScenePrefs) => void;
}) {
  return (
    <div class="studio-prefs">
      <mds-text id={PREFS_TITLE} typography="h6" tag="h2">
        Accessibility
      </mds-text>
      <mds-separator></mds-separator>
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
