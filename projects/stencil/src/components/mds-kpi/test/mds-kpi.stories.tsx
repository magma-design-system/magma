import { h } from '@stencil/core';

export default {
  title: 'UI / KPI',
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
