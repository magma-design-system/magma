import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';

export default {
  title: 'UI / Navigation / Breadcrumb / Breadcrumb Item',
  id: 'ui-breadcrumb-breadcrumb-item',
  argTypes: {
    selected: {
      type: { name: 'boolean', required: false },
      description: 'Choose if the component is selected or not',
    },
  },
};

const Template = (args) => (
  <mds-breadcrumb>
    <mds-breadcrumb-item {...args}></mds-breadcrumb-item>
    <mds-breadcrumb-item label="Second"></mds-breadcrumb-item>
    <mds-breadcrumb-item label="The third"></mds-breadcrumb-item>
  </mds-breadcrumb>
);

export const Default = {
  render: Template,

  args: {
    label: 'First item',
  },
};

export const Selected = {
  render: Template,

  args: {
    selected: true,
    label: 'First item',
  },
};

/**
 * Every state an item has of its own once the story has opened (#1440, @fixture/states), each in
 * a trail of its own: the item in the state is the second of the trail ("Pratiche"), the last one
 * in the states named `last`, the others are its context. At rest and current (the page you are on: `aria-current`, not clickable), with the
 * separator that follows it and, the last of the trail, without it, and the long label. The
 * states of the trail (where the current item is, the back arrow, the trail that scrolls) are in
 * the story of mds-breadcrumb. A state only an interaction reaches (`play: true`) is brought
 * there by the play function, which checks `selected`, not its look.
 */
interface ItemState {
  state: string;
  play?: boolean;
  /** the labels of the trail; the item in the state is `item` */
  items: string[];
  item: number;
  selected?: number;
}

const trail = ['Home', 'Pratiche', 'Pratica 128/2026'];

const itemStates: ItemState[] = [
  { state: 'rest, separator after it', items: trail, item: 1, selected: 2 },
  { state: 'current, separator after it', items: trail, item: 1, selected: 1 },
  { state: 'rest, last without separator', items: trail, item: 2, selected: 1 },
  { state: 'current, last without separator', items: trail, item: 2, selected: 2 },
  {
    state: 'long label',
    items: ['Home', 'Richiesta di accesso agli atti amministrativi del procedimento', 'Esito'],
    item: 1,
    selected: 2,
  },
  { state: 'chosen by a click', play: true, items: trail, item: 1, selected: 2 },
  { state: 'chosen with Enter', play: true, items: trail, item: 1, selected: 2 },
  { state: 'chosen with Space', play: true, items: trail, item: 1, selected: 2 },
];

const TemplateStates = () => (
  <StatesGrid>
    {itemStates.map(({ state, play, items, selected }) => (
      <StateCell key={state} state={state} play={play}>
        <mds-breadcrumb>
          {items.map((label, index) => (
            <mds-breadcrumb-item
              key={label}
              label={label}
              selected={index === selected ? true : undefined}
            ></mds-breadcrumb-item>
          ))}
        </mds-breadcrumb>
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
  const { item } = itemStates.find((entry) => entry.state === state)!;
  return cell.querySelectorAll('mds-breadcrumb-item')[item] as HTMLMdsBreadcrumbItemElement;
};

/**
 * A key sent to the inner button of the item, which listens to it (not the host): Enter on its
 * press, Space on its release.
 */
const key = (item: HTMLMdsBreadcrumbItemElement, type: 'keydown' | 'keyup', code: string) =>
  item.shadowRoot!.querySelector('mds-button')!.dispatchEvent(
    new KeyboardEvent(type, {
      code,
      key: code === 'Space' ? ' ' : code,
      bubbles: true,
      cancelable: true,
    }),
  );

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const clicked = await loadedItem(canvasElement, 'chosen by a click');
  (clicked.shadowRoot!.querySelector('mds-button') as HTMLElement).click();
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
