import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';
import { themeSchemeDictionary } from '../meta/dictionary';

export default {
  title: 'UI / Preferences / Theme',
  argTypes: {
    name: {
      type: { name: 'string' },
      description: 'Specifies the preference mode',
    },
    scheme: {
      type: { name: 'string' },
      options: themeSchemeDictionary,
      control: { type: 'select' },
      description: 'Specifies the transition of switching from a theme to another one',
    },
  },
};

const TemplateController = (args) => <mds-pref-theme {...args}></mds-pref-theme>;

const Template = (args) => (
  <mds-pref-theme {...args}>
    <mds-pref-theme-item label="Business" name="business" />
    <mds-pref-theme-item label="Editorial" name="editorial" />
  </mds-pref-theme>
);

export const Default = {
  render: TemplateController,
  args: {},
};

export const ThemeList = {
  render: Template,
  args: {},
};

/**
 * Every state of the theme control that one page can show at once (#1440, @fixture/states), each
 * in an mds-pref, the panel a product places it in, with the themes of its list as
 * mds-pref-theme-item entries.
 *
 * The theme is one for the whole page: a control writes it on `<html>` (its name, the scheme it
 * is applied with, the corner shape) and stores it, and every control reads the stored one back
 * on each render, before its props. So no cell sets a name, a scheme or a corner shape: every
 * control applies the theme the person keeps, or the base one, Business, and the trigger shows
 * the label of its entry. Another theme on the trigger, a theme of one mode (which locks
 * mds-pref-mode to it) and a corner shape are seen by picking them, which changes the whole page.
 * Without entries, the form a hidden controller takes, the trigger names the theme from `name`.
 *
 * The list is opened by the play in the last cell, which keeps the room it opens into, so that it
 * covers no other state; the play checks `visible` on its mds-dropdown. The entries show their
 * own states there: the theme of the page marked as the selected one, and the swatch of each
 * theme. No theme is picked: a pick changes the theme of the whole page. The play also gives back
 * the stored choices once the controls have stored the theme they applied on load.
 */
interface ThemeState {
  state: string;
  play?: boolean;
  panel?: Record<string, string>;
  entries?: boolean;
}

const listOpen = 'list open';

const themeStates: ThemeState[] = [
  { state: 'rest, the theme of the page', entries: true },
  { state: 'size sm', panel: { size: 'sm' }, entries: true },
  { state: 'size md', panel: { size: 'md' }, entries: true },
  { state: 'without entries' },
  { state: listOpen, play: true, entries: true },
];

const TemplateStates = () => (
  <StatesGrid>
    {themeStates.map(({ state, play, panel, entries }) => (
      <StateCell key={state} state={state} play={play}>
        <mds-pref {...panel}>
          {entries ? (
            <mds-pref-theme>
              <mds-pref-theme-item label="Business" name="business"></mds-pref-theme-item>
              <mds-pref-theme-item label="Editoriale" name="editorial"></mds-pref-theme-item>
              <mds-pref-theme-item label="Freddo" name="cool"></mds-pref-theme-item>
              <mds-pref-theme-item label="Caldo" name="warm"></mds-pref-theme-item>
            </mds-pref-theme>
          ) : (
            <mds-pref-theme></mds-pref-theme>
          )}
        </mds-pref>
        {/* the room the list opens into: four entries */}
        {state === listOpen && <div class="h-5200"></div>}
      </StateCell>
    ))}
  </StatesGrid>
);

const storageKeys = ['mdsPrefTheme', 'mdsPrefThemeScheme', 'mdsPrefCornerShape'];

type Kept = Record<string, string | null>;

/** What the storage keeps before the story: a loader reads it before the controls load */
const keptChoices = () => ({
  kept: Object.fromEntries(storageKeys.map((key) => [key, localStorage.getItem(key)])),
});

const giveBack = (kept: Kept) =>
  Object.entries(kept).forEach(([key, value]) =>
    value === null ? localStorage.removeItem(key) : localStorage.setItem(key, value),
  );

const playStates = async ({
  canvasElement,
  loaded,
}: {
  canvasElement: HTMLElement;
  loaded: { kept: Kept };
}) => {
  try {
    const elements = Array.from(canvasElement.querySelectorAll('*')).filter((element) =>
      element.tagName.startsWith('MDS-'),
    );
    await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));

    // the tab of the control opens the list: its handler sits on the tab item, which a click
    // sent with no pointer behind it reaches
    const control = stateCell(canvasElement, listOpen).querySelector(
      'mds-pref-theme',
    ) as HTMLMdsPrefThemeElement;
    (control.shadowRoot!.querySelector('#mds-pref-theme-nav') as HTMLElement).click();
    await waitFor(() =>
      expect(control.shadowRoot!.querySelector('mds-dropdown')).toHaveProperty('visible', true),
    );
  } finally {
    giveBack(loaded.kept);
  }
};

export const States = {
  render: TemplateStates,

  loaders: [keptChoices],

  play: playStates,
};
