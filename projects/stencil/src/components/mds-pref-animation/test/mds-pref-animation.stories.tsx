import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid } from '@fixture/states';

import { animationDictionary } from '../meta/dictionary';
import { AnimationModeType } from '../meta/types';

export default {
  title: 'UI / Preferences / Animation',
  argTypes: {
    mode: {
      type: { name: 'string' },
      options: animationDictionary,
      control: { type: 'select' },
      description: 'Specifies the preference mode',
    },
  },
};
const Template = (args) => <mds-pref-animation {...args} />;

export const Default = {
  render: Template,

  args: {},
};

/**
 * Every state of the animation control that one page can show at once (#1440, @fixture/states),
 * each in an mds-pref, the panel a product places it in.
 *
 * The animation preference is one for the whole page: a control applies it to `<html>` and
 * stores it, and every control of the page follows the last one applied. So no cell picks one:
 * each control is given the preference the page is in when the story renders (`pageAnimation`, a
 * link's included), and loading it changes nothing; where the page has none, the control applies
 * the one the person keeps, or `system`, as on any page. The selected item is that one; `reduce`
 * and `no-preference` selected are the same cells seen from the panel of Storybook or a link
 * (`globals=animation:reduce`), and the stronger ink of the items under more contrast with
 * `globals=contrast:more`.
 *
 * No state needs an interaction. The play gives back the stored choice once the controls have
 * stored the preference they applied on load: one the page only shows, a link's, is not kept
 * (#1436).
 */
interface AnimationState {
  state: string;
  panel?: Record<string, string>;
}

const animationStates: AnimationState[] = [
  { state: 'rest, the animation of the page' },
  { state: 'size sm', panel: { size: 'sm' } },
  { state: 'size md', panel: { size: 'md' } },
];

/** The animation on `<html>`: when the story renders, the preview's, a link's included */
const pageAnimation = (): AnimationModeType | undefined =>
  animationDictionary.find((animation) =>
    document.documentElement.classList.contains(`pref-animation-${animation}`),
  ) as AnimationModeType | undefined;

const TemplateStates = () => {
  const animation = pageAnimation();
  return (
    <StatesGrid>
      {animationStates.map(({ state, panel }) => (
        <StateCell key={state} state={state}>
          <mds-pref {...panel}>
            <mds-pref-animation mode={animation}></mds-pref-animation>
          </mds-pref>
        </StateCell>
      ))}
    </StatesGrid>
  );
};

type Kept = Record<string, string | null>;

/** What the storage keeps before the story: a loader reads it before the controls load */
const keptChoices = () => ({
  kept: { mdsPrefAnimation: localStorage.getItem('mdsPrefAnimation') },
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
    // the animation a link asks for is still the one of the page once the controls have applied
    // theirs (`unset` asks for none, and the controls apply one)
    if (globals.animation && globals.animation !== 'unset') {
      await expect(pageAnimation()).toBe(globals.animation);
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
