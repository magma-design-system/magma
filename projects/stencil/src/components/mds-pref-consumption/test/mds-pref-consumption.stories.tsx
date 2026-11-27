import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid } from '@fixture/states';

import { ConsumptionModeType } from '@type/preference';
import { consumptionDictionary } from '../meta/dictionary';

export default {
  title: 'UI / Preferences / Consumption',
  argTypes: {
    mode: {
      type: { name: 'string' },
      options: consumptionDictionary,
      control: { type: 'select' },
      description: 'Specifies the preference mode',
    },
  },
};
const Template = (args) => <mds-pref-consumption {...args} />;

export const Default = {
  render: Template,

  args: {},
};

/**
 * Every state of the consumption control that one page can show at once (#1440,
 * @fixture/states), each in an mds-pref, the panel a product places it in.
 *
 * The consumption is one for the whole page: a control applies it to `<html>` and stores it, and
 * every control of the page follows the last one applied. So no cell picks one: each control is
 * given the consumption the page is in when the story renders (`pageConsumption`, a link's
 * included), and loading it changes nothing; where the page has none, the control applies the
 * one the person keeps, or `high`, as on any page. The selected item is that one, in the colour
 * of its level; `medium` and `low` selected, each in its own colour, are the same cells seen from
 * the panel of Storybook or a link (`globals=consumption:low`), and the stronger ink of the items
 * under more contrast with `globals=contrast:more`.
 *
 * No state needs an interaction. The play gives back the stored choice once the controls have
 * stored the consumption they applied on load: one the page only shows, a link's, is not kept
 * (#1436).
 */
interface ConsumptionState {
  state: string;
  panel?: Record<string, string>;
}

const consumptionStates: ConsumptionState[] = [
  { state: 'rest, the consumption of the page' },
  { state: 'size sm', panel: { size: 'sm' } },
  { state: 'size md', panel: { size: 'md' } },
];

/** The consumption on `<html>`: when the story renders, the preview's, a link's included */
const pageConsumption = (): ConsumptionModeType | undefined =>
  consumptionDictionary.find((consumption) =>
    document.documentElement.classList.contains(`pref-consumption-${consumption}`),
  ) as ConsumptionModeType | undefined;

const TemplateStates = () => {
  const consumption = pageConsumption();
  return (
    <StatesGrid>
      {consumptionStates.map(({ state, panel }) => (
        <StateCell key={state} state={state}>
          <mds-pref {...panel}>
            <mds-pref-consumption mode={consumption}></mds-pref-consumption>
          </mds-pref>
        </StateCell>
      ))}
    </StatesGrid>
  );
};

type Kept = Record<string, string | null>;

/** What the storage keeps before the story: a loader reads it before the controls load */
const keptChoices = () => ({
  kept: { mdsPrefConsumption: localStorage.getItem('mdsPrefConsumption') },
});

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
    // the consumption a link asks for is still the one of the page once the controls have
    // applied theirs (`unset` asks for none, and the controls apply one)
    if (globals.consumption && globals.consumption !== 'unset') {
      await expect(pageConsumption()).toBe(globals.consumption);
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
