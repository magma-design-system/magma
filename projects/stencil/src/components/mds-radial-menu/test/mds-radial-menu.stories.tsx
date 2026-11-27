import { h } from '@stencil/core';
import { iconsDictionary } from '@type/icon';
import {
  ButtonVariantType,
  buttonVariantDictionary,
  buttonSizeDictionary,
  buttonToneVariantDictionary,
} from '@type/button';
import { directionDictionary } from '../meta/dictionary';
import { useState } from 'react';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';

export default {
  title: 'UI / Actions / Radial Menu',
  id: 'ui-radial-menu',
  argTypes: {
    'angle-start': {
      type: { name: 'number' },
      description: 'Specifies the starting angle of the menu',
    },
    'angle-end': {
      type: { name: 'number' },
      description: 'Specifies the ending angle of the menu',
    },
    radius: {
      type: { name: 'number' },
      control: { type: 'range', min: 1, max: 20 },
      description: 'Specifies the radius of the menu',
    },
    direction: {
      type: { name: 'string' },
      description: 'Specifies the direction of the menu elements',
      options: directionDictionary,
      control: { type: 'select' },
    },
    opened: {
      type: { name: 'boolean' },
      description: 'Specifies if the menu is opened or not',
    },
    disc: {
      type: { name: 'boolean' },
      description: 'Specifies if the menu has a disc beneath or not',
    },
    backdrop: {
      type: { name: 'boolean' },
      description: 'Specifies if the component has a backdrop background',
    },
    icon: {
      type: { name: 'string' },
      description: 'The icon displayed in the button',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string' },
      description: 'Specifies the color variant for the button',
      options: buttonVariantDictionary,
      control: { type: 'select' },
    },
    size: {
      type: { name: 'string' },
      description: 'Specifies the size for the button',
      options: buttonSizeDictionary,
      control: { type: 'select' },
    },
    tone: {
      type: { name: 'string' },
      description: 'Specifies the tone variant for the button',
      options: buttonToneVariantDictionary,
      control: { type: 'select' },
    },
  },
};

const Template = (args) => (
  <div class="h-dvh min-h-[600px] flex items-center justify-center">
    {args.interaction === 'rightclick' && (
      <mds-banner
        class="max-w-4xl"
        variant="info"
        tone="strong"
        icon="mi/baseline/list-alt"
        headline="Variant with contextual menu"
      >
        <mds-text>
          Use <b>Right click</b> of the mouse to trigger the component
        </mds-text>
      </mds-banner>
    )}
    <mds-radial-menu {...args}>
      <mds-radial-menu-item
        icon="mi/baseline/favorite"
        tooltip="Add to favorites"
        variant="dark"
        tone={args.interaction === 'rightclick' ? 'text' : 'weak'}
      ></mds-radial-menu-item>
      <mds-radial-menu-item
        icon="mi/baseline/email"
        tooltip="Send email"
        variant="dark"
        tone={args.interaction === 'rightclick' ? 'text' : 'weak'}
      ></mds-radial-menu-item>
      <mds-radial-menu-item
        icon="mi/baseline/insert-drive-file"
        tooltip="New document"
        variant="dark"
        tone={args.interaction === 'rightclick' ? 'text' : 'weak'}
      ></mds-radial-menu-item>
      <mds-radial-menu-item
        icon="mi/baseline/info"
        tooltip="Show infos"
        variant="dark"
        tone={args.interaction === 'rightclick' ? 'text' : 'weak'}
      ></mds-radial-menu-item>
      <mds-radial-menu-item
        icon="mi/baseline/print"
        tooltip="Print"
        variant="dark"
        tone={args.interaction === 'rightclick' ? 'text' : 'weak'}
      ></mds-radial-menu-item>
      <mds-radial-menu-item
        icon="mi/baseline/ios-share"
        tooltip="Share"
        variant="dark"
        tone={args.interaction === 'rightclick' ? 'text' : 'weak'}
      ></mds-radial-menu-item>
      <mds-radial-menu-item
        icon="mi/baseline/edit"
        tooltip="Edit metadata"
        variant="dark"
        tone={args.interaction === 'rightclick' ? 'text' : 'weak'}
      ></mds-radial-menu-item>
      <mds-radial-menu-item
        icon="mi/baseline/delete"
        tooltip="Delete"
        variant="error"
      ></mds-radial-menu-item>
    </mds-radial-menu>
  </div>
);

const TemplateImage = (args) => (
  <div class="h-dvh min-h-[600px] flex items-center justify-center">
    <div class="relative w-full max-w-[320px]">
      <mds-img src="./book-cover-10.webp" class="rounded-xl shadow-lg-sharp"></mds-img>
      <mds-radial-menu {...args} class="absolute top-600 right-600">
        <mds-radial-menu-item
          icon="mi/baseline/favorite"
          variant="light"
          tooltip="Add to favorites"
        ></mds-radial-menu-item>
        <mds-radial-menu-item
          icon="mi/baseline/ios-share"
          tooltip="Share"
          variant="light"
        ></mds-radial-menu-item>
        <mds-radial-menu-item
          icon="mi/baseline/delete"
          tooltip="Delete"
          variant="error"
        ></mds-radial-menu-item>
      </mds-radial-menu>
    </div>
  </div>
);

const TemplateNumericOrder = (args) => (
  <div class="h-dvh min-h-[600px] flex items-center justify-center">
    {args.interaction === 'rightclick' && (
      <mds-banner
        variant="info"
        tone="strong"
        icon="mi/baseline/list-alt"
        headline="Variant with contextual menu"
      >
        <mds-text>
          Use <b>Right click</b> of the mouse to trigger the component
        </mds-text>
      </mds-banner>
    )}
    <mds-radial-menu {...args}>
      <mds-radial-menu-item
        icon="mdi/numeric-1"
        tooltip="Item number 1"
        variant="info"
        tone={args.interaction === 'rightclick' ? 'text' : 'weak'}
      ></mds-radial-menu-item>
      <mds-radial-menu-item
        icon="mdi/numeric-2"
        tooltip="Item number 2"
        variant="info"
        tone={args.interaction === 'rightclick' ? 'text' : 'weak'}
      ></mds-radial-menu-item>
      <mds-radial-menu-item
        icon="mdi/numeric-3"
        tooltip="Item number 3"
        variant="success"
        tone={args.interaction === 'rightclick' ? 'text' : 'weak'}
      ></mds-radial-menu-item>
      <mds-radial-menu-item
        icon="mdi/numeric-4"
        tooltip="Item number 4"
        variant="success"
        tone={args.interaction === 'rightclick' ? 'text' : 'weak'}
      ></mds-radial-menu-item>
      <mds-radial-menu-item
        icon="mdi/numeric-5"
        tooltip="Item number 5"
        variant="warning"
        tone={args.interaction === 'rightclick' ? 'text' : 'weak'}
      ></mds-radial-menu-item>
      <mds-radial-menu-item
        icon="mdi/numeric-6"
        tooltip="Item number 6"
        variant="warning"
        tone={args.interaction === 'rightclick' ? 'text' : 'weak'}
      ></mds-radial-menu-item>
      <mds-radial-menu-item
        icon="mdi/numeric-7"
        tooltip="Item number 7"
        variant="error"
        tone={args.interaction === 'rightclick' ? 'text' : 'weak'}
      ></mds-radial-menu-item>
      <mds-radial-menu-item
        icon="mdi/numeric-8"
        tooltip="Item number 8"
        variant="error"
      ></mds-radial-menu-item>
    </mds-radial-menu>
  </div>
);

const TemplateAddRemoveItems = (args) => {
  const [count, setCount] = useState(6);
  return (
    <div class="h-dvh min-h-[600px] flex items-center justify-center relative">
      <div class="absolute top-600 left-600 flex gap-400 items-baseline">
        <mds-button onClick={() => setCount(count + 1)}>Add</mds-button>
        <mds-button onClick={() => setCount(count - 1)} disabled={count <= 1} variant="error">
          Remove
        </mds-button>
        <mds-text>Items count: {count}</mds-text>
      </div>
      <mds-radial-menu {...args}>
        {Array.from(Array(count).keys()).map((index) => (
          <mds-radial-menu-item
            slot="item"
            key={index}
            icon="mi/baseline/favorite"
            tooltip={`Element ${index + 1}`}
            variant="dark"
            tone="weak"
          ></mds-radial-menu-item>
        ))}
      </mds-radial-menu>
    </div>
  );
};

export const Default = {
  render: TemplateNumericOrder,
};

export const ImageOptions = {
  render: TemplateImage,

  args: {
    'angle-start': 180,
    'angle-end': 270,
    radius: 5,
    direction: 'counterclockwise',
  },
};

export const ContextualMenu = {
  render: Template,

  args: {
    interaction: 'rightclick',
    disc: true,
  },
};

export const AddRemoveItems = {
  render: TemplateAddRemoveItems,

  args: {
    radius: 5,
    opened: true,
  },
};

/**
 * Every state of the menu once the story has opened (#1440, @fixture/states): closed, with its
 * trigger in each tone, the primary variant, every size and an icon of its own; open, as a full
 * ring of six items, with the disc, a half ring of four, a quarter of three laid out
 * counterclockwise (a fan holds fewer items: the radius does not grow with them), a wider radius
 * and the smallest and largest size; and opened and closed again by a click on its trigger. An open
 * menu sits in a stage of its own, as tall as the ring and the disc, so that it covers no other
 * cell. The states an item has of its own are in the story of mds-radial-menu-item. Left to their
 * own stories: the backdrop, which dims the whole page, and `interaction="rightclick"`, whose menu
 * has no trigger and opens at the pointer (ContextualMenu). A state only an interaction reaches
 * (`play: true`) is brought there by the play function, which checks `opened`, not the look.
 */
interface RadialMenuState {
  state: string;
  play?: boolean;
  /** the menus of the cell, each with the ring of items */
  menus: Record<string, string | number | boolean>[];
  /** the height of the stage of an open ring, a step of the spacing scale */
  stage?: string;
  /** how many items of the ring the menus hold: fewer on a fan, as a product puts there */
  items?: number;
}

const ringItems: [string, string, ButtonVariantType?][] = [
  ['mi/baseline/favorite', 'Aggiungi ai preferiti'],
  ['mi/baseline/email', 'Invia per email'],
  ['mi/baseline/insert-drive-file', 'Nuovo documento'],
  ['mi/baseline/print', 'Stampa'],
  ['mi/baseline/ios-share', 'Condividi'],
  ['mi/baseline/delete', 'Elimina', 'error'],
];

const openedByClick = 'opened by a click';
const closedByClick = 'closed again by a click';

const radialMenuStates: RadialMenuState[] = [
  { state: 'closed (dark, strong, lg)', menus: [{}] },
  {
    state: 'closed, tone (strong, weak, outline, text)',
    menus: ['strong', 'weak', 'outline', 'text'].map((tone) => ({ tone })),
  },
  {
    state: 'closed, variant primary (strong, weak)',
    menus: ['strong', 'weak'].map((tone) => ({ variant: 'primary', tone })),
  },
  {
    state: 'closed, size (sm, md, lg, xl)',
    menus: ['sm', 'md', 'lg', 'xl'].map((size) => ({ size })),
  },
  { state: 'closed, icon of its own', menus: [{ icon: 'mi/baseline/add' }] },
  { state: 'open', menus: [{ opened: true }], stage: 'h-6400' },
  { state: 'open, with disc', menus: [{ opened: true, disc: true }], stage: 'h-6400' },
  {
    state: 'open, a half ring (0 to 180)',
    menus: [{ opened: true, 'angle-start': 0, 'angle-end': 180 }],
    stage: 'h-6400',
    items: 4,
  },
  {
    state: 'open, a quarter, counterclockwise (180 to 270)',
    menus: [{ opened: true, 'angle-start': 180, 'angle-end': 270, direction: 'counterclockwise' }],
    stage: 'h-6400',
    items: 3,
  },
  { state: 'open, radius 6rem', menus: [{ opened: true, radius: 6 }], stage: 'h-7600' },
  { state: 'open, size sm', menus: [{ opened: true, size: 'sm' }], stage: 'h-6400' },
  { state: 'open, size xl', menus: [{ opened: true, size: 'xl' }], stage: 'h-6400' },
  { state: openedByClick, play: true, menus: [{}], stage: 'h-6400' },
  { state: closedByClick, play: true, menus: [{ opened: true }], stage: 'h-6400' },
];

const TemplateStates = () => (
  <StatesGrid>
    {radialMenuStates.map(({ state, play, menus, stage, items }) => (
      <StateCell key={state} state={state} play={play}>
        <div class={`flex items-center justify-center gap-600 ${stage ?? ''}`}>
          {menus.map((props, index) => (
            <mds-radial-menu key={String(index)} {...props}>
              {ringItems.slice(-(items ?? ringItems.length)).map(([icon, tooltip, variant]) => (
                <mds-radial-menu-item
                  key={icon}
                  icon={icon}
                  tooltip={tooltip}
                  variant={variant ?? 'dark'}
                ></mds-radial-menu-item>
              ))}
            </mds-radial-menu>
          ))}
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

/** The menu of a cell, once every Magma element of the cell has loaded. */
const loadedMenu = async (canvasElement: HTMLElement, state: string) => {
  const cell = stateCell(canvasElement, state);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  return cell.querySelector('mds-radial-menu') as HTMLMdsRadialMenuElement;
};

/**
 * A click on the trigger, kept inside the menu (`composed: false`): on the document it would be a
 * click outside every other open menu of the page, which closes them, as it does in a product.
 */
const clickTrigger = (menu: HTMLMdsRadialMenuElement) =>
  menu
    .shadowRoot!.querySelector('.menu-button')!
    .dispatchEvent(new MouseEvent('click', { bubbles: true, composed: false }));

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const opened = await loadedMenu(canvasElement, openedByClick);
  clickTrigger(opened);
  const closed = await loadedMenu(canvasElement, closedByClick);
  clickTrigger(closed);

  // the property, not the attribute: Stencil reflects it on the next frame, and a hidden page
  // draws no frame
  await waitFor(() => expect(opened).toHaveProperty('opened', true));
  await waitFor(() => expect(closed).toHaveProperty('opened', undefined));
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
