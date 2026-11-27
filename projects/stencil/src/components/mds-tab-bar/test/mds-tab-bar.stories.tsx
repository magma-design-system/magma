import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';

export default {
  title: 'UI / Navigation / Tab Bar',
  id: 'ui-tab-bar',
};

const Template = (args) => (
  <mds-tab-bar {...args}>
    <mds-tab-bar-item icon="mdi/barley" selected label="First Blood"></mds-tab-bar-item>
    <mds-tab-bar-item icon="mdi/crown" label="Second Impact"></mds-tab-bar-item>
    <mds-tab-bar-item icon="mi/baseline/timer" label="The Third Reich"></mds-tab-bar-item>
    <mds-tab-bar-item
      icon="mi/baseline/account-balance"
      label="The Fantastic Four"
    ></mds-tab-bar-item>
    <mds-tab-bar-item
      icon="mi/baseline/account-balance-wallet"
      label="The Fifth Element"
    ></mds-tab-bar-item>
  </mds-tab-bar>
);

export const Default = {
  render: Template,
};

/**
 * Every state of the bar once the story has opened (#1440, @fixture/states): which item is
 * selected (the first, a middle one, none) and how many items share the bar. The bar is fixed to
 * the bottom of the viewport: each cell is a screen of its own, whose layout containment makes
 * it the box the bar is fixed to, so the bar stays in its cell as it stays at the bottom of a
 * phone. The states an item has of its own (without icon, its typography, the long label) are in
 * the story of mds-tab-bar-item. A state only an interaction reaches (`play: true`) is brought
 * there by the play function, which checks `selected` on the items, not their look.
 */
interface TabBarItem {
  label: string;
  icon: string;
  selected?: boolean;
}

interface TabBarState {
  state: string;
  play?: boolean;
  items: TabBarItem[];
}

const views: TabBarItem[] = [
  { label: 'Home', icon: 'mi/baseline/home' },
  { label: 'Pratiche', icon: 'mi/baseline/description' },
  { label: 'Agenda', icon: 'mi/baseline/calendar-today' },
  { label: 'Messaggi', icon: 'mi/baseline/email' },
  { label: 'Profilo', icon: 'mi/baseline/person' },
];

/** The items, the one of `label` selected; the others without the attribute, as in markup. */
const selecting = (items: TabBarItem[], label?: string): TabBarItem[] =>
  items.map((item) => (item.label === label ? { ...item, selected: true } : item));

const tabBarStates: TabBarState[] = [
  { state: 'first item selected', items: selecting(views, 'Home') },
  { state: 'a middle item selected', items: selecting(views, 'Agenda') },
  { state: 'no item selected', items: views },
  { state: 'three items', items: selecting(views.slice(0, 3), 'Home') },
  { state: 'another item chosen by a click', play: true, items: selecting(views, 'Home') },
  { state: 'another item chosen with Enter', play: true, items: selecting(views, 'Home') },
];

const TemplateStates = () => (
  <StatesGrid>
    {tabBarStates.map(({ state, play, items }) => (
      <StateCell key={state} state={state} play={play}>
        {/* the screen: its layout containment is what the fixed bar is placed against */}
        <div class="relative h-3000 overflow-hidden rounded-lg bg-surface-default [contain:layout]">
          <mds-tab-bar>
            {items.map((item) => (
              <mds-tab-bar-item key={item.label} {...item}></mds-tab-bar-item>
            ))}
          </mds-tab-bar>
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

/** The items of a cell, by label, once every Magma element of the cell has loaded. */
const loadedItems = async (canvasElement: HTMLElement, state: string) => {
  const cell = stateCell(canvasElement, state);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  return (label: string) =>
    cell.querySelector(`mds-tab-bar-item[label="${label}"]`) as HTMLMdsTabBarItemElement;
};

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const clicked = await loadedItems(canvasElement, 'another item chosen by a click');
  clicked('Agenda').click();
  // Enter on the item, which listens to it on its host
  const enter = await loadedItems(canvasElement, 'another item chosen with Enter');
  enter('Messaggi').dispatchEvent(
    new KeyboardEvent('keydown', { code: 'Enter', key: 'Enter', bubbles: true, cancelable: true }),
  );

  // the property, not the attribute: Stencil reflects it on the next frame, and a hidden page
  // draws no frame
  await waitFor(() => expect(clicked('Agenda')).toHaveProperty('selected', true));
  await waitFor(() => expect(clicked('Home')).toHaveProperty('selected', false));
  await waitFor(() => expect(enter('Messaggi')).toHaveProperty('selected', true));
  await waitFor(() => expect(enter('Home')).toHaveProperty('selected', false));
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
