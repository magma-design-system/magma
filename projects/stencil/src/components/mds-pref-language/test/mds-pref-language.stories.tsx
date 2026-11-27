import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';

import { languageDictionary } from '../meta/dictionary';

export default {
  title: 'UI / Preferences / Language',
  argTypes: {
    set: {
      type: { name: 'string' },
      options: languageDictionary,
      control: { type: 'select' },
      description: 'Specifies the preference mode',
    },
  },
};
const Template = (args) => (
  <mds-pref-language {...args}>
    <mds-pref-language-item code="it"></mds-pref-language-item>
    <mds-pref-language-item code="en"></mds-pref-language-item>
    <mds-pref-language-item code="el"></mds-pref-language-item>
  </mds-pref-language>
);

export const Default = {
  render: Template,

  args: {},
};

/**
 * Every state of the language control that one page can show at once (#1440, @fixture/states),
 * each in an mds-pref, the panel a product places it in, with the languages of its list as
 * mds-pref-language-item entries.
 *
 * The language is one for the whole page: a control writes it on `<html lang>`, which every
 * Magma component reads its texts from, and stores it. So no cell sets another language: each
 * control is given the one the page is in when the story renders (`pageLanguage`, a link's
 * included, or English, the one the components speak while the page names none), and loading it
 * changes nothing. The note that English stands in for a missing translation shows under any
 * other language: the same cells seen in another language, from the panel of Storybook or a link
 * (`globals=language:it`).
 *
 * The list is opened by the play in the last cell, which keeps the room it opens into, so that it
 * covers no other state; the play checks `visible` on its mds-dropdown. The entries show their
 * own states there, the language of the page marked as the selected one. No language is picked:
 * a pick changes the language of the whole page. The play also gives back the stored choice
 * once the controls have stored the language they applied on load: a language the page only
 * shows, a link's, is not kept (#1436).
 */
interface LanguageState {
  state: string;
  play?: boolean;
  panel?: Record<string, string>;
}

const listOpen = 'list open';

const languageStates: LanguageState[] = [
  { state: 'rest, the language of the page' },
  { state: 'size sm', panel: { size: 'sm' } },
  { state: 'size md', panel: { size: 'md' } },
  { state: listOpen, play: true },
];

/** The language on `<html lang>` when the story renders (a link's included), or English */
const pageLanguage = (): string => document.documentElement.getAttribute('lang') || 'en';

const TemplateStates = () => {
  const language = pageLanguage();
  return (
    <StatesGrid>
      {languageStates.map(({ state, play, panel }) => (
        <StateCell key={state} state={state} play={play}>
          <mds-pref {...panel}>
            <mds-pref-language set={language}>
              <mds-pref-language-item code="it"></mds-pref-language-item>
              <mds-pref-language-item code="en"></mds-pref-language-item>
              <mds-pref-language-item code="el"></mds-pref-language-item>
              <mds-pref-language-item code="es"></mds-pref-language-item>
            </mds-pref-language>
          </mds-pref>
          {/* the room the list opens into: four entries */}
          {state === listOpen && <div class="h-5200"></div>}
        </StateCell>
      ))}
    </StatesGrid>
  );
};

type Kept = Record<string, string | null>;

/** What the storage keeps before the story: a loader reads it before the controls load */
const keptChoices = () => ({ kept: { mdsPrefLanguage: localStorage.getItem('mdsPrefLanguage') } });

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
    // the language a link asks for is still the one of the page once the controls have applied
    // theirs (`unset` asks for none)
    if (globals.language && globals.language !== 'unset') {
      await expect(pageLanguage()).toBe(globals.language);
    }

    // the tab of the control opens the list: its handler sits on the tab item, which a click
    // sent with no pointer behind it reaches
    const control = stateCell(canvasElement, listOpen).querySelector(
      'mds-pref-language',
    ) as HTMLMdsPrefLanguageElement;
    (control.shadowRoot!.querySelector('#mds-pref-language-nav') as HTMLElement).click();
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
