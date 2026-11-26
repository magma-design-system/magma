import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid } from '@fixture/states';

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

/**
 * Every state of the group once the story has opened (#1440, @fixture/states). The group has no
 * props and no state of its own: what it does is join its members, so its states are the members
 * it joins, flat inner corners and 2px apart. A toolbar of icons, labelled actions in one tone and
 * in mixed emphasis, a segmented set with its current view, a split button at either end, one
 * member, a disabled one, the sizes, and the group stretched by a row that stacks, with and
 * without an icon-only member. Each icon-only member is named by `aria-label`, as a product names
 * it. The menu of a split button member is the story of mds-button-dropdown.
 */
interface Member {
  dropdown?: boolean;
  props: Record<string, string | boolean>;
}

interface GroupState {
  state: string;
  /** in a row of actions that stacks under 380px of its container, beside a cancel action */
  stacked?: boolean;
  members: Member[];
}

const bold = { icon: 'mi/baseline/format-bold', 'aria-label': 'Grassetto' };
const italic = { icon: 'mi/baseline/format-italic', 'aria-label': 'Corsivo' };
const format = { icon: 'mi/baseline/text-format', 'aria-label': 'Formato del testo' };
const views = ['Giorno', 'Settimana', 'Mese'];

const groupStates: GroupState[] = [
  {
    state: 'icon only, tone text',
    members: [bold, italic, format].map((icon) => ({
      props: { ...icon, variant: 'dark', tone: 'text' },
    })),
  },
  {
    state: 'icon only, tone weak',
    members: [bold, italic, format].map((icon) => ({
      props: { ...icon, variant: 'dark', tone: 'weak' },
    })),
  },
  {
    state: 'labelled, tone strong',
    members: ['Salva', 'Invia', 'Archivia'].map((label) => ({ props: { label } })),
  },
  {
    state: 'labelled, mixed emphasis',
    members: [
      { props: { label: 'Pubblica' } },
      { props: { label: 'Salva come bozza', tone: 'outline' } },
      { props: { label: 'Elimina', variant: 'error', tone: 'text' } },
    ],
  },
  {
    state: 'segmented, tone weak',
    members: views.map((label) => ({ props: { label, tone: 'weak', type: 'button' } })),
  },
  {
    state: 'segmented, one current',
    members: views.map((label) => ({
      props: {
        label,
        tone: 'weak',
        type: 'button',
        ...(label === 'Settimana' && { current: true }),
      },
    })),
  },
  {
    state: 'a split button last',
    members: [
      { props: { label: 'Esporta CSV', tone: 'weak' } },
      { dropdown: true, props: { label: 'Altri formati', tone: 'weak' } },
    ],
  },
  {
    state: 'a split button first',
    members: [
      { dropdown: true, props: { label: 'Esporta CSV', tone: 'weak' } },
      { props: { label: 'Anteprima', tone: 'weak' } },
    ],
  },
  { state: 'one member', members: [{ props: { label: 'Salva' } }] },
  {
    state: 'a disabled member',
    members: [
      { props: { label: 'Approva', variant: 'success' } },
      { props: { label: 'Rifiuta', variant: 'error', tone: 'outline', disabled: true } },
    ],
  },
  {
    state: 'size sm',
    members: [bold, italic, format].map((icon) => ({
      props: { ...icon, variant: 'dark', tone: 'weak', size: 'sm' },
    })),
  },
  {
    state: 'size lg',
    members: [{ props: { label: 'Salva', size: 'lg' } }, { props: { label: 'Invia', size: 'lg' } }],
  },
  {
    state: 'stretched in a stacked row',
    stacked: true,
    members: [
      { props: { label: 'Salva come bozza', tone: 'outline' } },
      { props: { label: 'Pubblica' } },
    ],
  },
  {
    state: 'stretched, with an icon-only member',
    stacked: true,
    members: [
      { props: { label: 'Pubblica' } },
      { props: { icon: 'mi/outline/schedule', 'aria-label': 'Programma la pubblicazione' } },
    ],
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {groupStates.map(({ state, stacked, members }) => {
      const group = (
        <mds-button-group>
          {members.map(({ dropdown, props }, index) =>
            dropdown ? (
              <mds-button-dropdown key={String(index)} {...props}>
                <mds-button variant="dark" tone="text" type="button" label="PDF"></mds-button>
                <mds-button variant="dark" tone="text" type="button" label="Excel"></mds-button>
              </mds-button-dropdown>
            ) : (
              <mds-button key={String(index)} {...props}></mds-button>
            ),
          )}
        </mds-button-group>
      );
      return (
        <StateCell key={state} state={state}>
          {stacked ? (
            <div class="@container w-full max-w-[320px]">
              <div class="flex justify-end gap-inline @max-actions:flex-col @max-actions:*:self-stretch">
                <mds-button variant="dark" tone="outline" label="Annulla"></mds-button>
                {group}
              </div>
            </div>
          ) : (
            <div class="flex">{group}</div>
          )}
        </StateCell>
      );
    })}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
