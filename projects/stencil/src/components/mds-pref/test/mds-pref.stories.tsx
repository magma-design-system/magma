import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';
import { animationDictionary } from '@component/mds-pref-animation/meta/dictionary';
import { consumptionDictionary } from '@component/mds-pref-consumption/meta/dictionary';
import { contrastDictionary } from '@component/mds-pref-contrast/meta/dictionary';
import { AnimationModeType } from '@component/mds-pref-animation/meta/types';
import { ContrastModeType } from '@component/mds-pref-contrast/meta/types';
import { modeDictionary } from '@component/mds-pref-mode/meta/dictionary';
import { ConsumptionModeType, PreferenceModeType } from '@type/preference';

import { tabSizeDictionary } from '@type/button';

export default {
  title: 'UI / Preferences / Pref',
  id: 'ui-preferences',
  argTypes: {
    controller: {
      type: { name: 'boolean' },
      description:
        'Sets if the component works as hidden element controller instead as UI element, visible on the DOM',
    },
    size: {
      type: { name: 'string' },
      description: 'Sets the size of the tab item',
      options: tabSizeDictionary,
      control: { type: 'select' },
    },
  },
};

const Template = (args) => (
  <mds-pref {...args}>
    <mds-pref-mode></mds-pref-mode>
    <mds-pref-theme>
      <mds-pref-theme-item name="default"></mds-pref-theme-item>
      <mds-pref-theme-item name="magma"></mds-pref-theme-item>
      <mds-pref-theme-item name="maggioli-editore"></mds-pref-theme-item>
    </mds-pref-theme>
    <mds-pref-contrast></mds-pref-contrast>
    <mds-pref-animation></mds-pref-animation>
    <mds-pref-consumption></mds-pref-consumption>
    <mds-pref-language>
      <mds-pref-language-item code="it"></mds-pref-language-item>
      <mds-pref-language-item code="en"></mds-pref-language-item>
      <mds-pref-language-item code="el"></mds-pref-language-item>
      <mds-pref-language-item code="es"></mds-pref-language-item>
      <mds-pref-language-item code="ja"></mds-pref-language-item>
    </mds-pref-language>
  </mds-pref>
);

const TemplateController = () => (
  <div>
    <mds-text>
      When attribute <mds-text typography="snippet">controller</mds-text> is set,{' '}
      <mds-text typography="snippet">mds-pref</mds-text> acts as ad hidden element which retrives
      user preferences from localStorage, it's useful when you dont' need to render the component
      but you need it sets used preferences based on localStorage method.
    </mds-text>
    <mds-pref controller>
      <mds-pref-mode></mds-pref-mode>
      <mds-pref-contrast></mds-pref-contrast>
      <mds-pref-animation></mds-pref-animation>
      <mds-pref-consumption></mds-pref-consumption>
      <mds-pref-language>
        <mds-pref-language-item code="it"></mds-pref-language-item>
        <mds-pref-language-item code="en"></mds-pref-language-item>
        <mds-pref-language-item code="el"></mds-pref-language-item>
        <mds-pref-language-item code="es"></mds-pref-language-item>
        <mds-pref-language-item code="ja"></mds-pref-language-item>
      </mds-pref-language>
    </mds-pref>
  </div>
);

export const Default = {
  render: Template,
  args: {},
};

export const Controller = {
  render: TemplateController,
};

/**
 * Every state of the panel that one page can show at once (#1440, @fixture/states), each with
 * the controls a product puts in it. The states of each control are in the control's own story.
 *
 * The preferences are one set for the whole page: each control applies its own to `<html>` and
 * stores it, and the controls of every panel follow the last one applied. So no cell picks a
 * preference: each control is given the one the page is in when the story renders (the
 * preview's, a link's included, `globals=mode:dark`), and loading the panels changes nothing;
 * where the page has none, a control applies the one the person keeps, or its default, as on any
 * page. The theme is the one the person keeps, or Business: a theme control reads the stored one
 * before its props.
 *
 * `size` reaches every control of the panel. A `controller` panel is hidden: its cell is empty by
 * design, while its controls apply the preferences of the page. `live-language` looks the same
 * as the panel at rest: it only keeps the notice away after a change of language.
 *
 * The reload notice is the one state only an interaction reaches: the play picks another
 * consumption in the last panel, checks the control took it and the panel shows the notice,
 * then picks the consumption of the page again, which the notice outlives. It also gives back the
 * stored choices once the controls have stored what they applied on load: a preference the page
 * only shows, a link's, is not kept (#1436).
 */
interface PanelState {
  state: string;
  play?: boolean;
  panel?: Record<string, string | boolean>;
}

const notice = 'reload notice, after a change of consumption';

const panelStates: PanelState[] = [
  { state: 'rest, every control' },
  { state: 'size sm', panel: { size: 'sm' } },
  { state: 'size md', panel: { size: 'md' } },
  { state: 'controller, hidden', panel: { controller: true } },
  { state: notice, play: true },
];

/** A preference on `<html>`: when the story renders, the preview's, a link's included */
const pageValue = <T extends string>(name: string, values: string[]): T | undefined =>
  values.find((value) => document.documentElement.classList.contains(`pref-${name}-${value}`)) as
    T | undefined;

const pageValues = () => ({
  mode: pageValue<PreferenceModeType>('mode', modeDictionary),
  contrast: pageValue<ContrastModeType>('contrast', contrastDictionary),
  animation: pageValue<AnimationModeType>('animation', animationDictionary),
  consumption: pageValue<ConsumptionModeType>('consumption', consumptionDictionary),
  // the language on `<html lang>`, or English, the one the components speak while it names none
  language: document.documentElement.getAttribute('lang') || 'en',
});

const TemplateStates = () => {
  const page = pageValues();
  return (
    <StatesGrid>
      {panelStates.map(({ state, play, panel }) => (
        <StateCell key={state} state={state} play={play}>
          <mds-pref {...panel}>
            <mds-pref-mode mode={page.mode}></mds-pref-mode>
            <mds-pref-theme>
              <mds-pref-theme-item label="Business" name="business"></mds-pref-theme-item>
              <mds-pref-theme-item label="Editoriale" name="editorial"></mds-pref-theme-item>
            </mds-pref-theme>
            <mds-pref-contrast mode={page.contrast}></mds-pref-contrast>
            <mds-pref-animation mode={page.animation}></mds-pref-animation>
            <mds-pref-consumption mode={page.consumption}></mds-pref-consumption>
            <mds-pref-language set={page.language}>
              <mds-pref-language-item code="it"></mds-pref-language-item>
              <mds-pref-language-item code="en"></mds-pref-language-item>
            </mds-pref-language>
          </mds-pref>
        </StateCell>
      ))}
    </StatesGrid>
  );
};

const storageKeys = [
  'mdsPrefMode',
  'mdsPrefContrast',
  'mdsPrefAnimation',
  'mdsPrefConsumption',
  'mdsPrefLanguage',
  'mdsPrefTheme',
  'mdsPrefThemeScheme',
  'mdsPrefCornerShape',
];

type Kept = Record<string, string | null>;

/** What the storage keeps before the story: a loader reads it before the controls load */
const keptChoices = () => ({
  kept: Object.fromEntries(storageKeys.map((key) => [key, localStorage.getItem(key)])),
});

const giveBack = (kept: Kept) =>
  Object.entries(kept).forEach(([key, value]) =>
    value === null ? localStorage.removeItem(key) : localStorage.setItem(key, value),
  );

/** Picks a consumption on the control, from its item: the handler sits on the tab item */
const pickConsumption = (control: HTMLMdsPrefConsumptionElement, value: string) =>
  (control.shadowRoot!.querySelector(`.item--${value}`) as HTMLElement).click();

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
    // what a link asks for is still the page's once the controls have applied theirs (`unset`
    // asks for none, and the controls apply one)
    const page: Record<string, string | undefined> = pageValues();
    for (const name of ['mode', 'contrast', 'animation', 'consumption', 'language']) {
      if (globals[name] && globals[name] !== 'unset') await expect(page[name]).toBe(globals[name]);
    }

    const cell = stateCell(canvasElement, notice);
    const panel = cell.querySelector('mds-pref') as HTMLMdsPrefElement;
    const consumption = cell.querySelector('mds-pref-consumption') as HTMLMdsPrefConsumptionElement;
    const before = consumption.mode as string;
    const other = before === 'low' ? 'high' : 'low';
    pickConsumption(consumption, other);
    await waitFor(() => expect(consumption).toHaveProperty('mode', other));
    // the notice is a state the panel keeps of its own, with no property: it is in its shadow root
    await waitFor(() => expect(panel.shadowRoot!.querySelector('.reload-required')).not.toBeNull());
    // the page gets its consumption back, and the notice stays, as after any change
    pickConsumption(consumption, before);
    await waitFor(() => expect(consumption).toHaveProperty('mode', before));
  } finally {
    giveBack(loaded.kept);
  }
};

export const States = {
  render: TemplateStates,

  loaders: [keptChoices],

  play: playStates,
};
