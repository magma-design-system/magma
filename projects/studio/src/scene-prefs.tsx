import animationEn from '../../stencil/src/components/mds-pref-animation/meta/locale.en.json';
import animationIt from '../../stencil/src/components/mds-pref-animation/meta/locale.it.json';
import consumptionEn from '../../stencil/src/components/mds-pref-consumption/meta/locale.en.json';
import consumptionIt from '../../stencil/src/components/mds-pref-consumption/meta/locale.it.json';
import contrastEn from '../../stencil/src/components/mds-pref-contrast/meta/locale.en.json';
import contrastIt from '../../stencil/src/components/mds-pref-contrast/meta/locale.it.json';
import modeEn from '../../stencil/src/components/mds-pref-mode/meta/locale.en.json';
import modeIt from '../../stencil/src/components/mds-pref-mode/meta/locale.it.json';
import { useLangOf, useT, type Lang } from './i18n.js';

/*
  The preferences of the person the Theme section checks a theme under, the accessibility of the
  scene: the mode and the contrast, then the animations and the consumption (the language is no
  part of it: the studio sets it from its own, i18n-previews.ts). A dropdown of the bar holds their
  controls. The studio writes every choice on the <html> of each frame itself, as the mds-pref-*
  write it: the mode and the contrast (frame.ts, applyFrame), since two frames side by side show
  the two modes, the animations and the consumption (applyPrefs). Magma applies them on the
  document of the scene and leaves the studio alone (#695, "The dogfooding constraint"). No
  mds-pref-* sits in the dropdown nor in the scene: the dropdown is on the document of the studio,
  and in the scene a component would keep the choice in the storage of the origin, which the
  frames share with the studio and its own preferences, in the menu of the bar (#1336). The choices
  are the modes of each component with its words (`meta/locale.<lang>.json`, imported) and its
  icons; scene-prefs.test.mts holds the modes, their order, the defaults and what is written to
  the components.
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

/** The preferences the dropdown offers, by the folder of their component. */
type Preference = 'animation' | 'consumption' | 'contrast' | 'mode';

/**
 * The words of each preference in each language of the studio: the ones of its component
 * (`meta/locale.<lang>.json`), so the dropdown says what the components say.
 */
export const PREF_WORDS: Record<Lang, Record<Preference, Record<string, string>>> = {
  en: { animation: animationEn, consumption: consumptionEn, contrast: contrastEn, mode: modeEn },
  it: { animation: animationIt, consumption: consumptionIt, contrast: contrastIt, mode: modeIt },
};

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
 * Sets the preferences on the `<html>` of a scene as mds-pref-animation and mds-pref-consumption
 * write them: the class `pref-<preference>-<mode>`, which the styles and the store of the Magma of
 * the page follow, and the custom property `--magma-pref-<preference>`. Written only when it
 * differs, so the store of the page hears of a change once.
 */
export function applyPrefs(scene: Document, prefs: ScenePrefs) {
  const html = scene.documentElement;
  const write = (preference: string, choices: ReadonlyArray<Choice<string>>, mode: string) => {
    const name = `pref-${preference}-${mode}`;
    if (!html.classList.contains(name)) {
      html.classList.remove(...choices.map((one) => `pref-${preference}-${one.mode}`));
      html.classList.add(name);
    }
    const property = `--magma-pref-${preference}`;
    if (html.style.getPropertyValue(property) !== mode) html.style.setProperty(property, mode);
  };
  write('animation', ANIMATIONS, prefs.animation);
  write('consumption', CONSUMPTIONS, prefs.consumption);
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
  const t = useT();
  const words = PREF_WORDS[useLangOf()];
  // both modes side by side is the studio's own choice, no mode of mds-pref-mode
  const modeWords = { ...words.mode, bothModes: t('Light and dark') };
  return (
    <div class="studio-panel">
      <mds-text id={PREFS_TITLE} typography="h6" tag="h2">
        {t('Accessibility')}
      </mds-text>
      <mds-separator></mds-separator>
      <Modes words={modeWords} choices={MODES} value={mode} onValue={onMode} off={modeOff} />
      <Modes words={words.contrast} choices={CONTRASTS} value={contrast} onValue={onContrast} />
      <Modes
        words={words.animation}
        choices={ANIMATIONS}
        value={prefs.animation}
        onValue={(animation) => onChange({ ...prefs, animation })}
      />
      <Modes
        words={words.consumption}
        choices={CONSUMPTIONS}
        value={prefs.consumption}
        onValue={(consumption) => onChange({ ...prefs, consumption })}
      />
    </div>
  );
}
