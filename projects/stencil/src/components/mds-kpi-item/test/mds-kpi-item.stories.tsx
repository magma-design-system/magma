import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';
import { iconsDictionary, mggIconsDictionary, svgIconsDictionary } from '@type/icon';

export default {
  title: 'UI / Data / KPI / KPI Item',
  id: 'ui-kpi-kpi-item',
  argTypes: {
    description: {
      type: { name: 'string' },
      description: 'Specifies the description under the value in the KPI element',
    },
    label: {
      type: { name: 'string' },
      description: 'Specifies the number to be displayed in the KPI element',
    },
    icon: {
      type: { name: 'string' },
      description: 'The name of the icon or a base64 string to render it as an svg',
      options: mggIconsDictionary.concat(iconsDictionary).concat(svgIconsDictionary),
      control: { type: 'select' },
    },
    threshold: {
      type: { name: 'number' },
      description: 'Specifies the number to be displayed in the KPI element',
    },
  },
};

const Template = (args) => (
  <mds-kpi>
    <mds-kpi-item {...args}></mds-kpi-item>
  </mds-kpi>
);

export const Default = {
  render: Template,

  args: {
    label: '400',
    icon: 'mi/baseline/description',
    description: 'Employees in 2021',
  },
};

/**
 * Every state an item has of its own once the story has opened (#1440, @fixture/states), each in
 * a KPI group of its own as wide as one item of a row (200px): icon, value and description, then
 * each without the parts it can leave out, the long value and the long description, and the
 * value revealed on scroll (`threshold`). How the group lays several items out is in the story of
 * mds-kpi. The name an item is announced by (value and description, or the `aria-label` of the
 * author) is not drawn: mds-kpi-item.e2e.ts tests it. The reveal (`play: true`) waits for the
 * item to be on screen: the play function scrolls it there and checks the texts the item gives
 * its value and description, which hold blanks until then.
 */
interface ItemState {
  state: string;
  play?: boolean;
  item: Record<string, string | number>;
}

const open = { icon: 'mi/baseline/description', label: '1.248', description: 'Pratiche aperte' };
const revealed = 'revealed on scroll';

const itemStates: ItemState[] = [
  { state: 'icon, value and description', item: open },
  { state: 'no icon', item: { label: '1.248', description: 'Pratiche aperte' } },
  { state: 'value only', item: { label: '1.248' } },
  {
    state: 'description only',
    item: { icon: 'mi/baseline/description', description: 'Pratiche aperte' },
  },
  { state: 'long value', item: { ...open, label: '12.480.512' } },
  {
    state: 'long description, wrapped',
    item: { ...open, description: 'Pratiche aperte in attesa della documentazione integrativa' },
  },
  { state: revealed, play: true, item: { ...open, threshold: 0.5 } },
];

const TemplateStates = () => (
  <StatesGrid>
    {itemStates.map(({ state, play, item }) => (
      <StateCell key={state} state={state} play={play}>
        <div class="max-w-5000">
          <mds-kpi>
            <mds-kpi-item {...item}></mds-kpi-item>
          </mds-kpi>
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const item = stateCell(canvasElement, revealed).querySelector(
    'mds-kpi-item',
  ) as HTMLMdsKpiItemElement;
  await waitFor(() => expect(item).toHaveAttribute('hydrated'));
  item.scrollIntoView({ block: 'center' });
  const text = (name: string) =>
    item.shadowRoot!.querySelector(`mds-text.${name}`) as HTMLMdsTextElement;
  await waitFor(() => expect(text('value')).toHaveProperty('text', '1.248'));
  await waitFor(() => expect(text('description')).toHaveProperty('text', 'Pratiche aperte'));
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
