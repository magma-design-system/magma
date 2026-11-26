import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';

export default {
  title: 'UI / Data / KPI',
  id: 'ui-kpi',
  argTypes: {
    description: {
      type: { name: 'string', required: true },
      description: 'Specifies the description under the label in the KPI element',
    },
    label: {
      type: { name: 'number', required: true },
      description: 'Specifies the number to be displayed in the KPI element',
    },
  },
};

const Template = (args) => (
  <mds-kpi {...args}>
    <mds-kpi-item
      icon="mi/baseline/directions-walk"
      label="75"
      description="Allenatori"
    ></mds-kpi-item>
    <mds-kpi-item icon="mi/baseline/sports" label="123" description="Arbitri"></mds-kpi-item>
    <mds-kpi-item icon="mi/baseline/sports-soccer" label="48" description="Tifosi"></mds-kpi-item>
    <mds-kpi-item icon="mi/baseline/stadium" label="188" description="Stadi"></mds-kpi-item>
    <mds-kpi-item
      icon="mi/baseline/directions-run"
      label="3"
      description="Giocatori"
    ></mds-kpi-item>
  </mds-kpi>
);

const TemplateScroll = (args) => (
  <div>
    <div class="flex min-h-screen pb-800">
      <div class="bg-label-orchid-10 flex flex-grow p-400 flex-col items-center justify-center rounded-3xl text-center fill-label-orchid-04">
        <div class="flex-grow flex flex-col items-center justify-center">
          <mds-text typography="detail">Scroll the page down to see text entrance effect.</mds-text>
          <mds-text typography="caption">(It will trigger once)</mds-text>
        </div>
        <div class="flex-grow flex ">
          <mds-icon name="mi/round/arrow-circle-down" class="self-end animate-bounce" />
        </div>
      </div>
    </div>
    <mds-kpi {...args}>
      <mds-kpi-item
        icon="mi/baseline/directions-walk"
        label="451"
        description="Progetti"
        threshold={0.5}
      ></mds-kpi-item>
      <mds-kpi-item
        icon="mi/baseline/sports"
        label="385"
        description="Manager"
        threshold={0.5}
      ></mds-kpi-item>
      <mds-kpi-item
        icon="mi/baseline/sports-soccer"
        label="196"
        description="Case"
        threshold={0.5}
      ></mds-kpi-item>
      <mds-kpi-item
        icon="mi/baseline/stadium"
        label="67"
        description="Automobili"
        threshold={0.5}
      ></mds-kpi-item>
      <mds-kpi-item
        icon="mi/baseline/directions-run"
        label="22"
        description="Formaggi"
        threshold={0.5}
      ></mds-kpi-item>
    </mds-kpi>
  </div>
);

export const Default = {
  render: Template,
};

export const ScrollEffect = {
  render: TemplateScroll,
};

/**
 * Every state the KPI group has of its own once the story has opened (#1440, @fixture/states):
 * how it lays out one, two, three and five items in the width of a column (as many columns of
 * at least 180px as fit, the rest wraps), and items of different content side by side, which keep
 * one height per row. What one item shows (icon, value, description, the reveal on scroll) is in
 * the story of mds-kpi-item. The pace and the placeholder of the reveal are custom properties of
 * the group, not states. No state needs an interaction.
 */
interface KpiState {
  state: string;
  items: Record<string, string>[];
}

const figures = [
  { icon: 'mi/baseline/description', label: '1.248', description: 'Pratiche aperte' },
  { icon: 'mi/baseline/done', label: '962', description: 'Pratiche chiuse' },
  { icon: 'mi/baseline/timer', label: '18', description: 'Giorni medi di attesa' },
  { icon: 'mi/baseline/warning', label: '37', description: 'Pratiche in ritardo' },
  { icon: 'mi/baseline/folder', label: '4', description: 'Uffici coinvolti' },
];

const kpiStates: KpiState[] = [
  { state: 'one item', items: figures.slice(0, 1) },
  { state: 'two items', items: figures.slice(0, 2) },
  { state: 'three items, wrapped', items: figures.slice(0, 3) },
  { state: 'five items, wrapped', items: figures },
  {
    state: 'items of different content in a row',
    items: [figures[0], { label: '962', description: 'Pratiche chiuse nel trimestre in corso' }],
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {kpiStates.map(({ state, items }) => (
      <StateCell key={state} state={state}>
        <mds-kpi>
          {items.map((item) => (
            <mds-kpi-item key={item.description} {...item}></mds-kpi-item>
          ))}
        </mds-kpi>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
