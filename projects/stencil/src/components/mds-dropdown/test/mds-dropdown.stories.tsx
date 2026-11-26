import { floatingUIPlacementDictionary, floatingUIStrategyDictionary } from '@type/floating-ui';
import { dropdownInteractionDictionary } from '../meta/dictionary';
import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';
import { useState, useEffect } from 'react';

export default {
  title: 'UI / Overlays / Dropdown',
  id: 'ui-dropdown',
  argTypes: {
    'hide-arrow': {
      type: { name: 'boolean' },
      description: 'If set, the component will not have an arrow pointing to the caller',
    },
    'arrow-padding': {
      type: { name: 'number' },
      description: 'Sets the distance between the arrow and dropdown margins',
    },
    'disable-auto-placement': {
      type: { name: 'boolean' },
      description: 'If set, the component will not be placed automatically near it’s caller',
    },
    backdrop: {
      type: { name: 'boolean' },
      description: 'Specifies if the component has a backdrop background',
    },
    flip: {
      type: { name: 'boolean' },
      description:
        'Specifies the placement of the component if no space is available where it is placed',
    },
    interaction: {
      type: { name: 'string' },
      description:
        'Specifies if the component is triggered from the caller on mouseover or click event',
      options: dropdownInteractionDictionary,
      control: { type: 'select' },
    },
    offset: {
      type: { name: 'number' },
      description: 'Sets distance between the dropdown and the caller',
    },
    placement: {
      type: { name: 'string' },
      description: 'Specifies where the component should be placed relative to the caller',
      options: floatingUIPlacementDictionary,
      control: { type: 'select' },
    },
    'disable-shift': {
      type: { name: 'boolean' },
      description: 'If set, the component will not be kept inside the viewport',
    },
    'shift-padding': {
      type: { name: 'number' },
      description: 'Sets a safe area distance between the dropdown and the body',
    },
    'disable-smooth': {
      type: { name: 'boolean' },
      description:
        'If set, the component will not follow the caller smoothly when the page scrolls',
    },
    strategy: {
      type: { name: 'string' },
      description: 'Sets the CSS position strategy of the component',
      options: floatingUIStrategyDictionary,
      control: { type: 'select' },
    },
    visible: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is visible',
    },
  },
};

const Template = ({ layout, ...args }) => (
  <div class={layout}>
    <mds-button id="my-dropdown">Show Fred</mds-button>
    <mds-dropdown target="#my-dropdown" {...args}>
      <mds-author class="text-tone-neutral-04">
        <mds-avatar
          aria-describedby="A protrait of Frederick Phillips Brooks Jr."
          initials="fb"
          src="./fred-brooks-zoom.webp"
          slot="avatar"
          class="w-2000 bg-brand-maggioli-06"
        />
        <mds-text typography="h6" class="text-tone-neutral-02">
          Fred Brooks
        </mds-text>
        <mds-text typography="caption">Software engineer</mds-text>
        <mds-text typography="caption">IT</mds-text>
      </mds-author>
      <mds-text typography="detail" class="text-tone-neutral-04">
        Frederick Phillips "Fred" Brooks Jr. (born April 19, 1931) is an American computer
        architect, software engineer, and computer scientist.
      </mds-text>
      <mds-hr class="h-[2px] bg-tone-neutral-08" />
      <mds-button class="justify-start px-0" icon="mi/baseline/info" variant="dark" tone="text">
        User infos
      </mds-button>
      <mds-button class="justify-start px-0" icon="mi/baseline/settings" variant="dark" tone="text">
        Account
      </mds-button>
      <mds-button class="justify-start px-0" icon="mi/baseline/logout" variant="dark" tone="text">
        Exit
      </mds-button>
    </mds-dropdown>
  </div>
);

const TemplatePlacement = ({ ...args }) => (
  <div class="min-h-dvh flex items-center justify-center">
    <mds-button id="my-dropdown">Show Fred</mds-button>
    <mds-dropdown target="#my-dropdown" {...args}>
      <mds-author class="text-tone-neutral-04">
        <mds-avatar
          aria-describedby="A protrait of Frederick Phillips Brooks Jr."
          initials="fb"
          src="./fred-brooks-zoom.webp"
          slot="avatar"
          class="w-2000 bg-brand-maggioli-06"
        />
        <mds-text typography="h6" class="text-tone-neutral-02">
          Fred Brooks
        </mds-text>
        <mds-text typography="caption">Software engineer</mds-text>
        <mds-text typography="caption">IT</mds-text>
      </mds-author>
      <mds-text typography="detail" class="text-tone-neutral-04">
        Frederick Phillips "Fred" Brooks Jr. (born April 19, 1931) is an American computer
        architect, software engineer, and computer scientist.
      </mds-text>
      <mds-hr class="h-[2px] bg-tone-neutral-08" />
      <mds-button class="justify-start px-0" icon="mi/baseline/info" variant="dark" tone="text">
        User infos
      </mds-button>
      <mds-button class="justify-start px-0" icon="mi/baseline/settings" variant="dark" tone="text">
        Account
      </mds-button>
      <mds-button class="justify-start px-0" icon="mi/baseline/logout" variant="dark" tone="text">
        Exit
      </mds-button>
    </mds-dropdown>
  </div>
);

export const NoTarget = () => (
  <div>
    <mds-button id="dropdown-trigger">Trigger</mds-button>
    {/* Intended the error here */}
    <mds-dropdown target="">
      <mds-text>Ciao</mds-text>
    </mds-dropdown>
  </div>
);

const TemplateNested = ({ ...args }) => (
  <div class="min-h-[200vh]">
    <mds-header>
      <mds-header-bar>
        <div class="flex gap-2 items-center">
          <mds-img class="w-1000" src="./logo-gruppo-maggioli.svg" />
          <div class="mb-1">
            <mds-text typography="h6">Gruppo Maggioli</mds-text>
            <mds-text class="text-tone-neutral-04" typography="option">
              Header by RD Team
            </mds-text>
          </div>
        </div>
        <mds-button slot="nav" id="my-dropdown">
          Show Fred
        </mds-button>
      </mds-header-bar>
    </mds-header>
    <mds-dropdown target="#my-dropdown" class="max-w-[350px]" {...args}>
      <mds-author class="text-tone-neutral-04">
        <mds-avatar
          aria-describedby="A protrait of Frederick Phillips Brooks Jr."
          initials="fb"
          src="./fred-brooks-zoom.webp"
          slot="avatar"
          class="w-20 bg-brand-maggioli-06"
        />
        <mds-text typography="h6" class="text-tone-neutral-02">
          Fred Brooks
        </mds-text>
        <mds-text typography="caption">Software engineer</mds-text>
        <mds-text typography="caption">IT</mds-text>
      </mds-author>
      <mds-text typography="detail" class="text-tone-neutral-04">
        Frederick Phillips "Fred" Brooks Jr. (born April 19, 1931) is an American computer
        architect, software engineer, and computer scientist.
      </mds-text>
      <mds-hr class="h-[2px] bg-tone-neutral-08" />
      <mds-button class="justify-start px-0" icon="mi/baseline/info" variant="dark" tone="text">
        User infos
      </mds-button>
      <mds-button class="justify-start px-0" icon="mi/baseline/settings" variant="dark" tone="text">
        Account
      </mds-button>
      <mds-button class="justify-start px-0" icon="mi/baseline/logout" variant="dark" tone="text">
        Exit
      </mds-button>
    </mds-dropdown>
  </div>
);

const TemplatePerformance = ({ ...args }) => (
  <div class="grid">
    {Array(400)
      .fill(null)
      .map((_value, index) => (
        <div
          key={index}
          class="h-[100px] flex items-start justify-center text-center border-0 border-t border-solid border-t-tone-neutral-07"
        >
          <p
            id={'button-' + index}
            class="px-200 py-100 rounded-b-lg bg-tone-neutral-10 border-t-0 border border-solid border-tone-neutral-07"
          >
            Pseudo-button {index}
          </p>
          <mds-dropdown target={'#button-' + index} {...args}>
            <p> Testo del dropdown per il bottone {index}</p>
          </mds-dropdown>
        </div>
      ))}
  </div>
);

const TemplateModalNested = () => {
  const [isModalOpened, setModalOpen] = useState(true);

  useEffect(() => {
    document.querySelector('mds-modal')?.addEventListener('mdsModalClose', () => {
      setModalOpen(false);
    });
  });

  return (
    <div class="grid">
      <div>
        <mds-button id="open-modal" onClick={() => setModalOpen(true)}>
          Open modal
        </mds-button>
      </div>
      <mds-modal position="right" opened={isModalOpened}>
        <header
          slot="top"
          class="p-800 flex gap-400 items-center border-b border-solid border-0 border-tone-neutral-09 max-w-[400px]"
        >
          <mds-img class="w-1600" src="./logo-gruppo-maggioli-512w.webp" />
          <div class="text-tone-neutral-02">
            <mds-text typography="h5" class="truncate min-w-0">
              Maggioli Editore
            </mds-text>
            <mds-text typography="detail" class="truncate min-w-0">
              Menu di servizio
            </mds-text>
          </div>
        </header>
        <div class="p-800 max-w-[400px] flex flex-col gap-400">
          <mds-button variant="primary" id="open-dropdown">
            Show dropdown
          </mds-button>
          <mds-dropdown target="#open-dropdown" backdrop={false} strategy="fixed">
            <mds-button variant="light" class="justify-start">
              Dropdown action
            </mds-button>
            <mds-button variant="light" class="justify-start">
              Dropdown action
            </mds-button>
            <mds-button variant="light" class="justify-start">
              Dropdown action
            </mds-button>
          </mds-dropdown>
          <mds-button variant="light" class="justify-start">
            Other action
          </mds-button>
          <mds-button variant="light" class="justify-start">
            Other action
          </mds-button>
          <mds-button variant="light" class="justify-start">
            Other action
          </mds-button>
        </div>
      </mds-modal>
    </div>
  );
};

const TemplateStrategy = ({ ...args }) => (
  <div class="min-h-[200vh]">
    <mds-header>
      <mds-header-bar>
        <div class="flex gap-2 items-center">
          <mds-img class="w-1000" src="./logo-gruppo-maggioli.svg" />
          <div class="mb-1">
            <mds-text typography="h6">Gruppo Maggioli</mds-text>
            <mds-text class="text-tone-neutral-04" typography="option">
              Header by RD Team
            </mds-text>
          </div>
        </div>
        <mds-button slot="nav" id="my-dropdown">
          Strategy fixed
        </mds-button>
        <mds-dropdown target="#my-dropdown" class="max-w-[350px]" {...args} strategy="fixed">
          <mds-author class="text-tone-neutral-04">
            <mds-avatar
              aria-describedby="A protrait of Frederick Phillips Brooks Jr."
              initials="fb"
              src="./fred-brooks-zoom.webp"
              slot="avatar"
              class="w-20 bg-brand-maggioli-06"
            />
            <mds-text typography="h6" class="text-tone-neutral-02">
              Fred Brooks
            </mds-text>
            <mds-text typography="caption">Software engineer</mds-text>
            <mds-text typography="caption">IT</mds-text>
          </mds-author>
          <mds-text typography="detail" class="text-tone-neutral-04">
            Frederick Phillips "Fred" Brooks Jr. (born April 19, 1931) is an American computer
            architect, software engineer, and computer scientist.
          </mds-text>
          <mds-hr class="h-[2px] bg-tone-neutral-08" />
          <mds-button class="justify-start px-0" icon="mi/baseline/info" variant="dark" tone="text">
            User infos
          </mds-button>
          <mds-button
            class="justify-start px-0"
            icon="mi/baseline/settings"
            variant="dark"
            tone="text"
          >
            Account
          </mds-button>
          <mds-button
            class="justify-start px-0"
            icon="mi/baseline/logout"
            variant="dark"
            tone="text"
          >
            Exit
          </mds-button>
        </mds-dropdown>
      </mds-header-bar>
    </mds-header>

    <div class="flex justify-end flex-col min-h-3200">
      <mds-button id="dropdown-absolute">Strategy absolute</mds-button>
      <mds-dropdown
        target="#dropdown-absolute"
        class="max-w-[350px]"
        {...args}
        strategy="absolute"
        z-index={10}
        shiftPadding={50}
      >
        <mds-author class="text-tone-neutral-04">
          <mds-avatar
            aria-describedby="A protrait of Frederick Phillips Brooks Jr."
            initials="fb"
            src="./fred-brooks-zoom.webp"
            slot="avatar"
            class="w-20 bg-brand-maggioli-06"
          />
          <mds-text typography="h6" class="text-tone-neutral-02">
            Fred Brooks
          </mds-text>
          <mds-text typography="caption">Software engineer</mds-text>
          <mds-text typography="caption">IT</mds-text>
        </mds-author>
        <mds-text typography="detail" class="text-tone-neutral-04">
          Frederick Phillips "Fred" Brooks Jr. (born April 19, 1931) is an American computer
          architect, software engineer, and computer scientist.
        </mds-text>
        <mds-hr class="h-[2px] bg-tone-neutral-08" />
        <mds-button class="justify-start px-0" icon="mi/baseline/info" variant="dark" tone="text">
          User infos
        </mds-button>
        <mds-button
          class="justify-start px-0"
          icon="mi/baseline/settings"
          variant="dark"
          tone="text"
        >
          Account
        </mds-button>
        <mds-button class="justify-start px-0" icon="mi/baseline/logout" variant="dark" tone="text">
          Exit
        </mds-button>
      </mds-dropdown>
    </div>
  </div>
);

const TemplateTarget = (args) => {
  return (
    <div class="grid gap-400 p-600 rounded-xl bg-tone-neutral-09">
      <mds-entity icon="mi/baseline/info" id="opendropdown">
        <mds-text>click to open dropdown</mds-text>
        <mds-button
          slot="action"
          icon="mi/baseline/warning"
          variant="warning"
          tone="weak"
          onClick={() => console.info('')}
        ></mds-button>
      </mds-entity>
      <mds-dropdown target="#opendropdown" {...args}>
        Dropdown
      </mds-dropdown>
      <mds-text typography="paragraph">
        Do not use other click actions inside a element designed as dropdown target because its
        never been executed
      </mds-text>
    </div>
  );
};

export const Default = {
  render: Template,

  args: {
    class: 'max-w-[350px] w-full',
    layout: 'flex justify-center',
  },
};

export const Arrow = {
  render: Template,

  args: {
    class: 'max-w-[350px] w-full',
    'hide-arrow': false,
    backdrop: true,
    'shift-padding': 32,
    layout: 'flex justify-start',
    visible: false,
  },
};

export const ArrowPadding = {
  render: Template,

  args: {
    class: 'max-w-[350px] w-full',
    'hide-arrow': false,
    backdrop: true,
    'arrow-padding': 50,
    'shift-padding': 32,
    layout: 'flex justify-start',
    visible: false,
  },
};

export const AutoPlacement = {
  render: Template,

  args: {
    class: 'max-w-[350px] w-full',
    'disable-auto-placement': false,
    layout: 'flex justify-end',
    visible: false,
  },
};

export const Backdrop = {
  render: Template,

  args: {
    class: 'max-w-[350px] w-full',
    backdrop: true,
    layout: 'flex justify-center',
    visible: false,
  },
};

export const Flip = {
  render: Template,

  args: {
    class: 'max-w-[350px] w-full',
    layout: 'flex h-[150vh] justify-center items-center',
    flip: true,
    visible: false,
  },
};

export const Interaction = {
  render: Template,

  args: {
    class: 'max-w-[350px] w-full',
    backdrop: true,
    interaction: 'mouseover',
    layout: 'flex justify-center',
    visible: false,
  },
};

export const Offset = {
  render: Template,

  args: {
    class: 'max-w-[350px] w-full',
    layout: 'flex justify-center items-center',
    offset: 50,
    backdrop: true,
    visible: false,
  },
};

export const Placement = {
  render: TemplatePlacement,

  args: {
    class: 'max-w-[350px] w-full',
    layout: 'flex justify-center items-center',
    placement: 'right-start',
    backdrop: true,
    visible: false,
  },
};

export const Shift = {
  render: Template,

  args: {
    class: 'max-w-[350px] w-full',
    layout: 'flex justify-end',
    'disable-shift': false,
    visible: false,
  },
};

export const ShiftPadding = {
  render: Template,

  args: {
    class: 'max-w-[350px] w-full',
    layout: 'flex justify-end',
    'disable-shift': false,
    'shift-padding': 50,
    visible: false,
  },
};

export const Smooth = {
  render: Template,

  args: {
    class: 'max-w-[350px] w-full',
    layout: 'flex justify-start h-[100vh] mt-[25vh]',
    'disable-smooth': false,
    visible: false,
  },
};

export const Strategy = {
  render: TemplateStrategy,

  args: {
    class: 'max-w-[350px] w-full',
    layout: 'flex justify-start',
    visible: false,
  },
};

export const NestedBestPractice = {
  render: TemplateNested,

  args: {
    backdrop: true,
    strategy: 'fixed',
  },
};

export const Performance = TemplatePerformance.bind({
  backdrop: true,
});

export const ModalNested = {
  render: TemplateModalNested,
  args: {},
};

export const Target = {
  render: TemplateTarget,
  args: {},
};

/**
 * Every state of the dropdown once the story has opened (#1440, @fixture/states), each with a
 * caller of its own in the room its panel opens into, so that no panel covers another cell.
 *
 * - The open states are set by `visible`, and nothing in the story clicks: a click on the page
 *   closes every open panel, and the click on a caller even sends one to the body to close the
 *   others, so a panel opened by a click would close all the cells. The click is in the e2e tests
 *   ("clicks on the caller"), and on the page: a click on a caller here opens its panel and closes
 *   the rest.
 * - The placements are pinned (`disable-auto-placement`, `disable-shift`): auto-placement and shift
 *   answer to the viewport, and on a grid taller than the screen they move the panel of a cell
 *   below the fold to another side, or out of its cell. The default, `bottom` with auto-placement
 *   and shift, is the first open cell, inside the screen; the moves are in the stories
 *   AutoPlacement, Flip and Shift and in the e2e tests.
 * - The panel is a `menu` of real entries, the buttons it holds, or declares another role when it
 *   holds anything else (`role="group"`), as a product does: a `menu` over arbitrary content is
 *   what axe rejects.
 * - Left to other stories: `backdrop` (Backdrop), which dims the whole page, not a cell, and
 *   `offset`, `arrow-padding`, `shift-padding`, `disable-smooth` and `z-index`, measures of the
 *   placement rather than states.
 *
 * A state only an interaction reaches (`play: true`) is brought there by the play function, which
 * checks `visible`, and the entry that has the focus, not the look: the pointer over a caller of
 * `interaction="mouseover"`, and the down arrow on the caller of a menu, which lands on its first
 * entry.
 */
interface DropdownState {
  state: string;
  play?: boolean;
  // the room of the cell the panel opens into, and where the caller stands in it
  stage: string;
  dropdown?: Record<string, string | boolean>;
  // what the panel holds: a menu of actions, or a group that is not one
  panel?: 'menu' | 'group';
}

const dropdownPinned = { 'disable-auto-placement': true, 'disable-shift': true };

// above and below the caller a panel and its offset; beside it, the width of the cell and the
// height of the panel where it goes past the caller
const panelRoomOf = (placement: string): string => {
  const [side, align] = placement.split('-');
  if (side === 'left' || side === 'right') {
    const justify = side === 'left' ? 'justify-end' : 'justify-start';
    // with the arrow, a start or an end panel passes the edge of the caller by a little: the
    // arrow keeps its padding from the corner while it points at the middle of the caller
    const room = { start: 'pt-600 pb-4000', end: 'pt-4000 pb-600' }[align] ?? 'py-2000';
    return `flex ${justify} ${room}`;
  }
  const justify = { start: 'justify-start', end: 'justify-end' }[align] ?? 'justify-center';
  return `flex ${justify} ${side === 'top' ? 'pt-6000' : 'pb-6000'}`;
};

const pinnedPanelPlacements = [
  'top',
  'top-start',
  'top-end',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
  'right',
  'right-start',
  'right-end',
];

const keyboardState = 'opened from the keyboard, on the first entry';

const dropdownStates: DropdownState[] = [
  { state: 'closed', stage: panelRoomOf('bottom') },
  { state: 'open, bottom (default)', stage: panelRoomOf('bottom'), dropdown: { visible: true } },
  {
    state: 'open, a panel that is not a menu',
    stage: panelRoomOf('bottom'),
    dropdown: { ...dropdownPinned, role: 'group', visible: true },
    panel: 'group',
  },
  {
    state: 'open, without the arrow',
    stage: panelRoomOf('bottom'),
    dropdown: { ...dropdownPinned, 'hide-arrow': true, visible: true },
  },
  {
    state: 'open, strategy fixed',
    stage: panelRoomOf('bottom'),
    dropdown: { ...dropdownPinned, strategy: 'fixed', visible: true },
  },
  ...pinnedPanelPlacements.map((placement) => ({
    state: `open, ${placement}`,
    stage: panelRoomOf(placement),
    dropdown: { ...dropdownPinned, placement, visible: true },
  })),
  {
    state: 'opened by the pointer, interaction mouseover',
    play: true,
    stage: panelRoomOf('bottom'),
    dropdown: { ...dropdownPinned, interaction: 'mouseover' },
  },
  { state: keyboardState, play: true, stage: panelRoomOf('bottom'), dropdown: dropdownPinned },
];

const TemplateStates = () => (
  <StatesGrid>
    {dropdownStates.map(({ state, play, stage, dropdown, panel = 'menu' }, index) => (
      <StateCell key={state} state={state} play={play}>
        <div class={stage}>
          {panel === 'menu' ? (
            <mds-button
              id={`dropdown-state-${index}`}
              icon="mi/baseline/more-vert"
              label="Azioni"
              variant="primary"
              tone="weak"
            ></mds-button>
          ) : (
            <mds-button
              id={`dropdown-state-${index}`}
              label="Come usiamo i tuoi dati"
              variant="primary"
              tone="weak"
            ></mds-button>
          )}
          {panel === 'menu' ? (
            <mds-dropdown target={`#dropdown-state-${index}`} {...dropdown}>
              <mds-button icon="mi/baseline/edit" label="Modifica" variant="dark" tone="text" />
              <mds-button icon="mi/baseline/download" label="Scarica" variant="dark" tone="text" />
              <mds-button icon="mi/baseline/delete" label="Elimina" variant="error" tone="text" />
            </mds-dropdown>
          ) : (
            <mds-dropdown target={`#dropdown-state-${index}`} {...dropdown}>
              <mds-text typography="tip">I dati restano sui server di Maggioli.</mds-text>
              <mds-button
                href="#policy"
                label="Leggi la policy"
                variant="dark"
                tone="text"
                size="sm"
              />
            </mds-dropdown>
          )}
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

/** The caller and the panel of a cell, once every Magma element of the cell has loaded. */
const loadedDropdown = async (canvasElement: HTMLElement, state: string) => {
  const cell = stateCell(canvasElement, state);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  const dropdown = cell.querySelector('mds-dropdown') as HTMLMdsDropdownElement;
  // the caller is wired once the panel has found it, and named itself a menu
  await waitFor(() => expect(dropdown.getAttribute('role')).toBe('menu'));
  return { caller: cell.querySelector(dropdown.target) as HTMLMdsButtonElement, dropdown };
};

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  // the pointer over the caller opens the panel after --mds-dropdown-mouseover-delay
  const pointed = await loadedDropdown(
    canvasElement,
    'opened by the pointer, interaction mouseover',
  );
  pointed.caller.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

  // the caller of a menu listens to its keys: the down arrow opens the panel on its first entry.
  // The key waits for the panel to settle: once loaded, a closed panel goes from the display it had
  // before its styles to none in a transition, laid out all along, and an arrow pressed then opens
  // it without moving the focus (the entry looks shown, and its focus is refused)
  const keyboard = await loadedDropdown(canvasElement, keyboardState);
  await waitFor(() => expect(keyboard.dropdown.getAnimations()).toHaveLength(0));
  keyboard.caller.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }),
  );

  // the property, not the attribute: Stencil reflects it on the next frame, and a hidden page
  // draws no frame
  await waitFor(() => expect(pointed.dropdown).toHaveProperty('visible', true));
  await waitFor(() => expect(keyboard.dropdown).toHaveProperty('visible', true));
  await waitFor(() =>
    expect(document.activeElement).toBe(keyboard.dropdown.querySelector('mds-button')),
  );
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
