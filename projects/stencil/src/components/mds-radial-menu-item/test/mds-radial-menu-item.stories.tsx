import { h } from '@stencil/core';
import { iconsDictionary } from '@type/icon';
import { buttonVariantDictionary, buttonToneVariantDictionary } from '@type/button';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';

export default {
  title: 'UI / Actions / Radial Menu / Radial Menu Item',
  id: 'ui-radial-menu-radial-menu-item',
  argTypes: {
    tooltip: {
      type: { name: 'string' },
      description: 'The tooltip displayed when hovering over the button',
    },
    icon: {
      type: { name: 'string' },
      description: 'The icon displayed in the button',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    tone: {
      type: { name: 'string' },
      description: 'Specifies the tone variant for the button',
      options: buttonToneVariantDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string' },
      description: 'Specifies the color variant for the button',
      options: buttonVariantDictionary,
      control: { type: 'select' },
    },
  },
};

const Template = (args) => (
  <div class="h-dvh min-h-[600px] flex items-center justify-center">
    <mds-radial-menu opened size="lg">
      <mds-radial-menu-item {...args}></mds-radial-menu-item>
    </mds-radial-menu>
  </div>
);

export const Default = {
  render: Template,

  args: {
    icon: 'mi/round/email',
  },
};

/**
 * Every state an item has of its own once the story has opened (#1440, @fixture/states), each in
 * an open menu of its own, at the right of its trigger: the default tone and the other three,
 * every variant (the light one in a light menu on the inverse surface, as over an image), the item
 * without a tooltip, named after its icon, and the tooltip shown under the pointer. The states
 * that come from the menu (open and closed, its size, which it gives every item, the angles, the
 * radius, the disc) are in the story of mds-radial-menu. A state only an interaction reaches
 * (`play: true`) is brought there by the play function, which checks the property, not the look:
 * the pointer entering the item is sent as its event, `mouseenter`, which shows the tooltip.
 */
interface ItemState {
  state: string;
  play?: boolean;
  /** the inverse surface, under a light menu */
  inverse?: boolean;
  item: Record<string, string>;
}

const mail = { icon: 'mi/baseline/email', tooltip: 'Invia per email' };
const tooltipShown = 'tooltip shown, pointer over it';

const itemStates: ItemState[] = [
  { state: 'rest (dark, weak)', item: mail },
  ...['strong', 'outline', 'text'].map((tone) => ({
    state: `tone ${tone}`,
    item: { ...mail, tone },
  })),
  ...[
    ['primary', 'mi/baseline/edit', 'Modifica'],
    ['secondary', 'mi/baseline/share', 'Condividi'],
    ['ai', 'mi/baseline/auto-awesome', 'Riassumi'],
    ['error', 'mi/baseline/delete', 'Elimina'],
    ['warning', 'mi/baseline/warning', 'Segnala'],
    ['success', 'mi/baseline/check', 'Approva'],
    ['info', 'mi/baseline/info', 'Dettagli'],
  ].map(([variant, icon, tooltip]) => ({
    state: `variant ${variant}`,
    item: { icon, tooltip, variant },
  })),
  {
    state: 'variant light, in a light menu',
    inverse: true,
    item: { ...mail, variant: 'light' },
  },
  { state: 'without tooltip, named after its icon', item: { icon: 'mi/baseline/print' } },
  { state: tooltipShown, play: true, item: mail },
];

const TemplateStates = () => (
  <StatesGrid>
    {itemStates.map(({ state, play, inverse, item }) => (
      <StateCell key={state} state={state} play={play}>
        <div
          class={`flex h-3200 items-center justify-center${inverse ? ' bg-surface-inverse rounded-lg' : ''}`}
        >
          <mds-radial-menu opened variant={inverse ? 'light' : undefined}>
            <mds-radial-menu-item {...item}></mds-radial-menu-item>
          </mds-radial-menu>
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const cell = stateCell(canvasElement, tooltipShown);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  const item = cell.querySelector('mds-radial-menu-item') as HTMLMdsRadialMenuItemElement;
  // the button of the item is the caller of its tooltip, in the shadow root of the item
  item.shadowRoot!.querySelector('.button')!.dispatchEvent(new MouseEvent('mouseenter'));

  // the property, not the attribute: Stencil reflects it on the next frame, and a hidden page
  // draws no frame
  await waitFor(() =>
    expect(item.shadowRoot!.querySelector('mds-tooltip')).toHaveProperty('visible', true),
  );
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
