import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';

export default {
  title: 'UI / Navigation / Breadcrumb',
  id: 'ui-breadcrumb',
  argTypes: {
    'hide-back': {
      type: { name: 'boolean', required: false },
      description: 'Hides the back arrow button',
    },
  },
};

const Template = (args) => (
  <mds-breadcrumb {...args}>
    <mds-breadcrumb-item label="First item"></mds-breadcrumb-item>
    <mds-breadcrumb-item label="Second"></mds-breadcrumb-item>
    <mds-breadcrumb-item label="The third"></mds-breadcrumb-item>
  </mds-breadcrumb>
);

export const Default = {
  render: Template,
};

/**
 * Every state of the trail once the story has opened (#1440, @fixture/states): where the current
 * item is, and with it the back arrow (disabled on the first item, or when no item is current),
 * without the arrow, a single item, and the trail longer than its room, which scrolls. The states
 * an item has of its own (at rest, current, without the separator, the long label) are in the
 * story of mds-breadcrumb-item. A state only an interaction reaches (`play: true`) is brought
 * there by the play function, which checks `selected` on the items and `disabled` on the arrow,
 * not their look.
 */
interface BreadcrumbState {
  state: string;
  play?: boolean;
  breadcrumb?: Record<string, boolean>;
  items: string[];
  selected?: number;
}

const trail = ['Home', 'Pratiche', 'Pratica 128/2026'];
const longTrail = [
  'Home',
  'Servizi al cittadino',
  'Anagrafe e stato civile',
  'Certificati anagrafici',
  'Richiesta del certificato di residenza storico',
  'Riepilogo',
];

const breadcrumbStates: BreadcrumbState[] = [
  { state: 'no item current', items: trail },
  { state: 'first item current', items: trail, selected: 0 },
  { state: 'middle item current', items: trail, selected: 1 },
  { state: 'last item current', items: trail, selected: 2 },
  { state: 'without back arrow', breadcrumb: { 'hide-back': true }, items: trail, selected: 2 },
  { state: 'one item', items: ['Home'], selected: 0 },
  { state: 'long trail, scrolls', items: longTrail, selected: 5 },
  { state: 'an item chosen by a click', play: true, items: trail, selected: 2 },
  { state: 'back by the arrow', play: true, items: trail, selected: 2 },
  { state: 'back by the arrow to the first item', play: true, items: trail, selected: 1 },
];

const TemplateStates = () => (
  <StatesGrid>
    {breadcrumbStates.map(({ state, play, breadcrumb, items, selected }) => (
      <StateCell key={state} state={state} play={play}>
        <mds-breadcrumb {...breadcrumb}>
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

/** The items and the back arrow of a cell, once every Magma element of the cell has loaded. */
const loadedTrail = async (canvasElement: HTMLElement, state: string) => {
  const cell = stateCell(canvasElement, state);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  const breadcrumb = cell.querySelector('mds-breadcrumb') as HTMLMdsBreadcrumbElement;
  const items = Array.from(
    cell.querySelectorAll('mds-breadcrumb-item'),
  ) as HTMLMdsBreadcrumbItemElement[];
  const back = breadcrumb.shadowRoot!.querySelector('.back') as HTMLMdsButtonElement;
  return { items, back };
};

/** The inner button of an item: the item listens on it, not on its host. */
const itemButton = (item: HTMLMdsBreadcrumbItemElement) =>
  item.shadowRoot!.querySelector('mds-button') as HTMLMdsButtonElement;

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const clicked = await loadedTrail(canvasElement, 'an item chosen by a click');
  itemButton(clicked.items[1]).click();
  const back = await loadedTrail(canvasElement, 'back by the arrow');
  back.back.click();
  const first = await loadedTrail(canvasElement, 'back by the arrow to the first item');
  first.back.click();

  // the properties, not the attributes: Stencil reflects them on the next frame, and a hidden
  // page draws no frame
  await waitFor(() => expect(clicked.items[1]).toHaveProperty('selected', true));
  await waitFor(() => expect(clicked.items[2]).toHaveProperty('selected', false));
  await waitFor(() => expect(clicked.back).not.toHaveProperty('disabled', true));
  await waitFor(() => expect(back.items[1]).toHaveProperty('selected', true));
  await waitFor(() => expect(back.items[2]).toHaveProperty('selected', false));
  await waitFor(() => expect(first.items[0]).toHaveProperty('selected', true));
  await waitFor(() => expect(first.items[1]).toHaveProperty('selected', false));
  await waitFor(() => expect(first.back).toHaveProperty('disabled', true));
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
