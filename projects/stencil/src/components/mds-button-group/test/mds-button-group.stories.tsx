import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';

export default {
  title: 'UI / Actions / Button group',
  id: 'ui-button-group',
};

const Template = (args) => (
  <mds-button-group {...args}>
    <mds-button icon="mi/baseline/text-format" variant="dark" tone="text"></mds-button>
    <mds-button icon="mi/baseline/text-rotate-up" variant="dark" tone="text"></mds-button>
    <mds-button icon="mi/baseline/wrap-text" variant="dark" tone="text"></mds-button>
  </mds-button-group>
);

const TemplateComplex = (args) => (
  <div>
    <mds-button-group {...args}>
      <mds-button icon="mi/baseline/text-format" variant="dark" tone="text"></mds-button>
      <mds-button icon="mi/baseline/text-rotate-up" variant="dark" tone="text"></mds-button>
      <mds-button icon="mi/baseline/wrap-text" variant="dark" tone="text"></mds-button>
    </mds-button-group>
  </div>
);

export const Default = {
  render: Template,
};
export const ComplexBar = {
  render: TemplateComplex,
};

// actions/stacked (#1189): under 380px of its container the row stacks and stretches every
// labelled action; the group shares the width among its labelled members, across the row as the
// action above it (#1340)
const TemplateStackedRow = (args) => (
  <div class="@container w-full max-w-[320px]">
    <div class="flex justify-end gap-inline @max-actions:flex-col @max-actions:*:self-stretch">
      <mds-button variant="dark" tone="outline" label="Annulla"></mds-button>
      <mds-button-group {...args}>
        <mds-button variant="primary" tone="outline" label="Salva come bozza"></mds-button>
        <mds-button variant="primary" label="Pubblica"></mds-button>
      </mds-button-group>
    </div>
  </div>
);

export const StackedRow = {
  render: TemplateStackedRow,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const group = canvasElement.querySelector('mds-button-group')!;
    const members = Array.from(group.children);
    await waitFor(() => {
      for (const component of [group, ...members]) expect(component).toHaveAttribute('hydrated');
    });
    const row = group.parentElement!.getBoundingClientRect();

    await waitFor(() => {
      expect(members[0].getBoundingClientRect().left).toBeCloseTo(row.left, 0);
      expect(members[1].getBoundingClientRect().right).toBeCloseTo(row.right, 0);
    });
  },
};
