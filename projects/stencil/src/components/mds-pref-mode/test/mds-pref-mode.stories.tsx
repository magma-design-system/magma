import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid } from '@fixture/states';
import { PreferenceModeType } from '@type/preference';
import { modeDictionary, transitionDictionary } from '../meta/dictionary';

export default {
  title: 'UI / Preferences / Mode',
  argTypes: {
    mode: {
      type: { name: 'string' },
      options: modeDictionary,
      control: { type: 'select' },
      description: 'Specifies the preference mode',
    },
    transition: {
      type: { name: 'string' },
      options: transitionDictionary,
      control: { type: 'select' },
      description: 'Specifies the transition of switching from a theme to another one',
    },
  },
};
const Template = (args) => <mds-pref-mode {...args} />;

export const Default = {
  render: Template,

  args: {},
};

/**
 * Every state of the mode control that one page can show at once (#1440, @fixture/states), each
 * in an mds-pref, the panel a product places it in.
 *
 * The mode is one for the whole page: a control applies it to `<html>` and stores it, and every
 * control of the page follows the last one applied. So no cell picks a mode: each control is
 * given the mode the page is in when the story renders (`pageMode`, the preview's, a link's
 * included), and loading it changes nothing. Storybook opens in light, so the light item is the
 * selected one; system and dark selected without a lock are the same cells seen in that mode,
 * from the panel of Storybook or a link (`globals=mode:dark`, `globals=mode:system`).
 *
 * The lock is the one way to show a mode without applying it: `locked-scheme`, which a theme of
 * one mode sets in a product (set here on the control, so that no theme of one mode turns the
 * whole page), shows that mode selected and disables the other two items, and leaves the page in
 * its own. The transition plays only while the mode changes, over the whole page: no state.
 *
 * No state needs an interaction. The play gives back the stored choice once the controls have
 * stored the mode they applied on load: a mode the page only shows, a link's, is not kept (#1436).
 */
interface ModeState {
  state: string;
  panel?: Record<string, string>;
  control?: Record<string, string>;
}

const modeStates: ModeState[] = [
  { state: 'rest, the mode of the page' },
  { state: 'size sm', panel: { size: 'sm' } },
  { state: 'size md', panel: { size: 'md' } },
  { state: 'locked to light', control: { 'locked-scheme': 'light' } },
  { state: 'locked to dark', control: { 'locked-scheme': 'dark' } },
];

/** The mode on `<html>`: when the story renders, the preview's, a link's included */
const pageMode = (): PreferenceModeType | undefined =>
  modeDictionary.find((mode) =>
    document.documentElement.classList.contains(`pref-mode-${mode}`),
  ) as PreferenceModeType | undefined;

const TemplateStates = () => {
  const mode = pageMode();
  return (
    <StatesGrid>
      {modeStates.map(({ state, panel, control }) => (
        <StateCell key={state} state={state}>
          <mds-pref {...panel}>
            <mds-pref-mode mode={mode} {...control}></mds-pref-mode>
          </mds-pref>
        </StateCell>
      ))}
    </StatesGrid>
  );
};

type Kept = Record<string, string | null>;

/** What the storage keeps before the story: a loader reads it before the controls load */
const keptChoices = () => ({ kept: { mdsPrefMode: localStorage.getItem('mdsPrefMode') } });

const giveBack = (kept: Kept) =>
  Object.entries(kept).forEach(([key, value]) =>
    value === null ? localStorage.removeItem(key) : localStorage.setItem(key, value),
  );

const playStates = async ({
  canvasElement,
  globals,
  loaded,
}: {
  canvasElement: HTMLElement;
  globals: Record<string, string>;
  loaded: { kept: Kept };
}) => {
  try {
    const elements = Array.from(canvasElement.querySelectorAll('*')).filter((element) =>
      element.tagName.startsWith('MDS-'),
    );
    await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
    // the mode a link asks for is still the one of the page once the controls have applied theirs
    if (globals.mode) await expect(pageMode()).toBe(globals.mode);
  } finally {
    giveBack(loaded.kept);
  }
};

export const States = {
  render: TemplateStates,

  loaders: [keptChoices],

  play: playStates,
};
