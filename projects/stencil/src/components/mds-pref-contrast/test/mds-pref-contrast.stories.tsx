import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid } from '@fixture/states';

import { contrastDictionary } from '../meta/dictionary';
import { ContrastModeType } from '../meta/types';

export default {
  title: 'UI / Preferences / Contrast',
  argTypes: {
    mode: {
      type: { name: 'string' },
      options: contrastDictionary,
      control: { type: 'select' },
      description: 'Specifies the preference mode',
    },
  },
};
const Template = (args) => <mds-pref-contrast {...args} />;

export const Default = {
  render: Template,

  args: {},
};

/**
 * Every state of the contrast control that one page can show at once (#1440, @fixture/states),
 * each in an mds-pref, the panel a product places it in.
 *
 * The contrast is one for the whole page: a control applies it to `<html>` and stores it, and
 * every control of the page follows the last one applied. So no cell picks a contrast: each
 * control is given the contrast the page is in when the story renders (`pageContrast`, a link's
 * included), and loading it changes nothing; where the page has none, the control applies the
 * one the person keeps, or `system`, as on any page. The selected item is that one; `more` and
 * `no-preference` selected, and the stronger ink the items take under more contrast, are the
 * same cells seen from the panel of Storybook or a link (`globals=contrast:more`).
 *
 * No state needs an interaction. The play gives back the stored choice once the controls have
 * stored the contrast they applied on load: a contrast the page only shows, a link's, is not
 * kept (#1436).
 */
interface ContrastState {
  state: string;
  panel?: Record<string, string>;
}

const contrastStates: ContrastState[] = [
  { state: 'rest, the contrast of the page' },
  { state: 'size sm', panel: { size: 'sm' } },
  { state: 'size md', panel: { size: 'md' } },
];

/** The contrast on `<html>`: when the story renders, the preview's, a link's included */
const pageContrast = (): ContrastModeType | undefined =>
  contrastDictionary.find((contrast) =>
    document.documentElement.classList.contains(`pref-contrast-${contrast}`),
  ) as ContrastModeType | undefined;

const TemplateStates = () => {
  const contrast = pageContrast();
  return (
    <StatesGrid>
      {contrastStates.map(({ state, panel }) => (
        <StateCell key={state} state={state}>
          <mds-pref {...panel}>
            <mds-pref-contrast mode={contrast}></mds-pref-contrast>
          </mds-pref>
        </StateCell>
      ))}
    </StatesGrid>
  );
};

type Kept = Record<string, string | null>;

/** What the storage keeps before the story: a loader reads it before the controls load */
const keptChoices = () => ({ kept: { mdsPrefContrast: localStorage.getItem('mdsPrefContrast') } });

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
    // the contrast a link asks for is still the one of the page once the controls have applied
    // theirs (`unset` asks for none, and the controls apply one)
    if (globals.contrast && globals.contrast !== 'unset') {
      await expect(pageContrast()).toBe(globals.contrast);
    }
  } finally {
    giveBack(loaded.kept);
  }
};

export const States = {
  render: TemplateStates,

  loaders: [keptChoices],

  play: playStates,
};
