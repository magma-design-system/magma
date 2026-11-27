import { typographySmallerDictionary } from '@type/typography';
import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';

export default {
  title: 'UI / Navigation / Tab Bar / Tab Bar Item',
  id: 'ui-tab-bar-tab-bar-item',
  argTypes: {
    selected: {
      type: { name: 'boolean' },
      description: 'Specifies if the component item is selected or not',
    },
    typography: {
      type: { name: 'string' },
      description: 'Specifies the typography of the element',
      options: typographySmallerDictionary,
      control: { type: 'select' },
    },
  },
};

const Template = (args) => (
  <mds-tab-bar>
    <mds-tab-bar-item {...args} icon="mdi/barley" selected label="First Blood"></mds-tab-bar-item>
    <mds-tab-bar-item {...args} icon="mdi/crown" label="Second Impact"></mds-tab-bar-item>
    <mds-tab-bar-item {...args} icon="mi/baseline/timer" label="The Third Reich"></mds-tab-bar-item>
    <mds-tab-bar-item
      {...args}
      icon="mi/baseline/account-balance"
      label="The Fantastic Four"
    ></mds-tab-bar-item>
    <mds-tab-bar-item
      {...args}
      icon="mi/baseline/account-balance-wallet"
      label="The Fifth Element"
    ></mds-tab-bar-item>
  </mds-tab-bar>
);

export const Default = {
  render: Template,
};

/**
 * Every state an item has of its own once the story has opened (#1440, @fixture/states), each in
 * a bar of three: the item in the state is the first ("Pratiche"), the others are its context. At
 * rest and selected, without its icon, in the other typography of the set (`option`), and the
 * long label that wraps. The label in the default slot is deprecated (`label` replaces it) and
 * left out. The bar is fixed to the bottom of the viewport: each cell is a screen of its own,
 * whose layout containment keeps the bar in it. The states of the bar (which item is selected,
 * how many share it) are in the story of mds-tab-bar. A state only an interaction reaches
 * (`play: true`) is brought there by the play function, which checks `selected`, not its look.
 */
interface ItemState {
  state: string;
  play?: boolean;
  /** the props of the item in the state */
  item: Record<string, string | boolean>;
  /** whether the context of the bar has a selected item */
  otherSelected?: boolean;
}

const cases = { label: 'Pratiche', icon: 'mi/baseline/description' };

const itemStates: ItemState[] = [
  { state: 'rest', item: cases, otherSelected: true },
  { state: 'selected', item: { ...cases, selected: true } },
  { state: 'without icon', item: { label: 'Pratiche' }, otherSelected: true },
  { state: 'without icon, selected', item: { label: 'Pratiche', selected: true } },
  { state: 'option typography', item: { ...cases, typography: 'option' }, otherSelected: true },
  {
    state: 'option typography, selected',
    item: { ...cases, typography: 'option', selected: true },
  },
  {
    state: 'long label',
    item: { ...cases, label: 'Pratiche in attesa di integrazione' },
    otherSelected: true,
  },
  { state: 'chosen by a click', play: true, item: cases, otherSelected: true },
  { state: 'chosen with Enter', play: true, item: cases, otherSelected: true },
  { state: 'chosen with Space', play: true, item: cases, otherSelected: true },
];

const TemplateStates = () => (
  <StatesGrid>
    {itemStates.map(({ state, play, item, otherSelected }) => (
      <StateCell key={state} state={state} play={play}>
        {/* the screen: its layout containment is what the fixed bar is placed against */}
        <div class="relative h-3000 overflow-hidden rounded-lg bg-surface-default [contain:layout]">
          <mds-tab-bar>
            <mds-tab-bar-item {...item}></mds-tab-bar-item>
            <mds-tab-bar-item
              label="Agenda"
              icon="mi/baseline/calendar-today"
              selected={otherSelected}
            ></mds-tab-bar-item>
            <mds-tab-bar-item label="Profilo" icon="mi/baseline/person"></mds-tab-bar-item>
          </mds-tab-bar>
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

/** The item of a cell in the state, once every Magma element of the cell has loaded. */
const loadedItem = async (canvasElement: HTMLElement, state: string) => {
  const cell = stateCell(canvasElement, state);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  return cell.querySelector('mds-tab-bar-item') as HTMLMdsTabBarItemElement;
};

/** A key sent to the item, which listens on its host: Enter on its press, Space on its release. */
const key = (item: HTMLElement, type: 'keydown' | 'keyup', code: string) =>
  item.dispatchEvent(
    new KeyboardEvent(type, {
      code,
      key: code === 'Space' ? ' ' : code,
      bubbles: true,
      cancelable: true,
    }),
  );

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const clicked = await loadedItem(canvasElement, 'chosen by a click');
  clicked.click();
  const enter = await loadedItem(canvasElement, 'chosen with Enter');
  key(enter, 'keydown', 'Enter');
  const space = await loadedItem(canvasElement, 'chosen with Space');
  key(space, 'keydown', 'Space');
  key(space, 'keyup', 'Space');

  // the property, not the attribute: Stencil reflects it on the next frame, and a hidden page
  // draws no frame
  await waitFor(() => expect(clicked).toHaveProperty('selected', true));
  await waitFor(() => expect(enter).toHaveProperty('selected', true));
  await waitFor(() => expect(space).toHaveProperty('selected', true));
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
