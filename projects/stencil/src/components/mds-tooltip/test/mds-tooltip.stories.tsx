import {
  floatingUIPlacementDictionary,
  floatingUIRelationDictionary,
  floatingUIStrategyDictionary,
} from '@type/floating-ui';
import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';
import { typographyTooltipDictionary } from '@type/typography';

export default {
  title: 'UI / Overlays / Tooltip',
  id: 'ui-tooltip',
  argTypes: {
    'hide-arrow': {
      type: { name: 'boolean' },
      description: 'If set, the component will not have an arrow pointing to the caller',
    },
    'disable-auto-placement': {
      type: { name: 'boolean' },
      description: 'If set, the component will not be placed automatically near it’s caller',
    },
    delay: {
      type: { name: 'number' },
      description: 'Sets the delay time when the tooltip is triggered',
    },
    flip: {
      type: { name: 'boolean' },
      description:
        'Specifies the placement of the component if no space is available where it is placed',
    },
    offset: {
      type: { name: 'number' },
      description: 'Sets distance between the tooltip and the caller',
    },
    placement: {
      type: { name: 'string' },
      description: 'Specifies where the component should be placed relative to the caller',
      options: floatingUIPlacementDictionary,
      control: { type: 'select' },
    },
    relation: {
      type: { name: 'string' },
      description:
        'Sets what the tooltip is to its caller: its description, or its label when the tooltip holds the only visible name of the caller',
      options: floatingUIRelationDictionary,
      control: { type: 'select' },
    },
    typography: {
      description: 'Specifies the font typography of the element',
      options: typographyTooltipDictionary,
      control: { type: 'select' },
    },
    'disable-shift': {
      type: { name: 'boolean' },
      description: 'If set, the component will not be kept inside the viewport',
    },
    'shift-padding': {
      type: { name: 'number' },
      description: 'Sets a safe area distance between the tooltip and the body',
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
    <mds-button id="my-tooltip">Show Fred</mds-button>
    <mds-tooltip target="#my-tooltip" {...args}>
      This is a tooltip comment.
    </mds-tooltip>
  </div>
);

const TemplateCustomContents = ({ layout, ...args }) => (
  <div class={layout}>
    <mds-button id="my-tooltip">Show Fred</mds-button>
    <mds-tooltip target="#my-tooltip" {...args} style={{ '--mds-tooltip-delay': '0.25s' }}>
      <mds-author class="text-tone-neutral-04 p-200">
        <mds-avatar
          initials="fb"
          src="./fred-brooks-zoom.webp"
          slot="avatar"
          class="w-1400 bg-brand-maggioli-06"
        />
        <mds-text typography="h6" class="text-tone-neutral-02">
          Fred Brooks
        </mds-text>
        <mds-text typography="caption">Software engineer</mds-text>
        <mds-text typography="caption">IT</mds-text>
      </mds-author>
    </mds-tooltip>
  </div>
);

const TemplateIconOnly = ({ layout, ...args }) => (
  <div class={layout}>
    <mds-button id="my-tooltip" icon="mi/baseline/palette" variant="dark" tone="text"></mds-button>
    <mds-tooltip target="#my-tooltip" {...args}>
      Tokens
    </mds-tooltip>
  </div>
);

export const NoTarget = () => (
  <div>
    <mds-button id="tooltip-trigger">Trigger</mds-button>
    {/* Intended the error here */}
    <mds-tooltip target="tooltip-trigger">Follow mouse?</mds-tooltip>
  </div>
);

export const Default = {
  render: Template,

  args: {
    layout: 'flex justify-center',
  },
};

export const CustomContents = {
  render: TemplateCustomContents,

  args: {
    layout: 'flex justify-center',
  },
};

export const Arrow = {
  render: Template,

  args: {
    'hide-arrow': false,
    'shift-padding': 32,
    layout: 'flex justify-start',
  },
};

export const AutoPlacement = {
  render: Template,

  args: {
    'disable-auto-placement': false,
    layout: 'flex justify-end',
  },
};

export const Flip = {
  render: Template,

  args: {
    layout: 'flex h-[200vh] justify-center items-center',
    flip: true,
  },
};

export const Offset = {
  render: Template,

  args: {
    layout: 'flex justify-center items-center',
    offset: 50,
  },
};

export const Placement = {
  render: Template,

  args: {
    'disable-auto-placement': true,
    layout: 'flex justify-center items-center',
    placement: 'right-start',
  },
};

export const Shift = {
  render: Template,

  args: {
    layout: 'flex justify-end',
    'disable-shift': false,
  },
};

export const ShiftPadding = {
  render: Template,

  args: {
    layout: 'flex justify-end',
    'disable-shift': false,
    'shift-padding': 50,
  },
};

export const Strategy = {
  render: Template,

  args: {
    layout: 'flex justify-start',
    strategy: 'absolute',
  },
};

export const Visible = {
  render: Template,

  args: {
    layout: 'flex justify-start',
  },
};

// The tooltip is the name of an icon-only button: aria-labelledby on the button, no title from
// the icon slug, nothing read twice (#923)
export const LabelOfAnIconOnlyButton = {
  render: TemplateIconOnly,

  args: {
    layout: 'flex justify-center',
    relation: 'label',
  },
};

/**
 * Every state of the tooltip once the story has opened (#1440, @fixture/states), each with a
 * caller of its own in the room its tooltip opens into, so that no tooltip covers another cell.
 * The visible states are set by `visible`, which nothing on the page takes back: a tooltip hides
 * on the events of its own caller only, so the open cells do not close each other.
 *
 * The placements are pinned (`disable-auto-placement`, `disable-shift`): auto-placement and shift
 * answer to the viewport, and on a grid taller than the screen they move the tooltip of a cell
 * below the fold to another side, or out of its cell, so each cell would show where the page was
 * scrolled to instead of its placement. The default placement, `top` with auto-placement, is the
 * first open cell, inside the screen; the moves of auto-placement are in the stories AutoPlacement,
 * Flip and Shift and in the e2e tests. `hideArrow` and `arrowPadding` are internal, so not states.
 *
 * A state only an interaction reaches (`play: true`) is brought there by the play function, which
 * checks `visible`, not the look: the pointer entering the caller, the focus the keyboard gives it
 * (the tooltip opens on a `:focus-visible` focus only, #1432) and Escape after the pointer, which
 * hides it until the caller is entered again (WCAG 1.4.13).
 */
interface TooltipState {
  state: string;
  play?: boolean;
  // the room of the cell the tooltip opens into, and where the caller stands in it
  stage: string;
  // a button with its label by default
  caller?: Record<string, string>;
  tooltip?: Record<string, string | boolean>;
  text?: string;
}

const tooltipText = 'Scarica il verbale in PDF';
const download: Record<string, string> = { label: 'Scarica', variant: 'primary', tone: 'weak' };
const pinned = { 'disable-auto-placement': true, 'disable-shift': true };

// above and below the caller a line of tooltip and its offset; beside it, the width of the cell
const roomOf = (placement: string): string => {
  const [side, align] = placement.split('-');
  if (side === 'left') return 'flex justify-end';
  if (side === 'right') return 'flex justify-start';
  const justify = { start: 'justify-start', end: 'justify-end' }[align] ?? 'justify-center';
  return `flex ${justify} ${side === 'top' ? 'pt-1200' : 'pb-1200'}`;
};

const pinnedPlacements = [
  'top-start',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
  'right',
  'right-start',
  'right-end',
];

const tooltipStates: TooltipState[] = [
  { state: 'hidden', stage: roomOf('top') },
  { state: 'visible, top (default)', stage: roomOf('top'), tooltip: { visible: true } },
  ...pinnedPlacements.map((placement) => ({
    state: `visible, ${placement}`,
    stage: roomOf(placement),
    tooltip: { ...pinned, placement, visible: true },
  })),
  {
    state: 'typography caption',
    stage: 'flex justify-center pt-1600',
    tooltip: { ...pinned, typography: 'caption', visible: true },
  },
  {
    state: 'typography detail',
    stage: 'flex justify-center pt-1600',
    tooltip: { ...pinned, typography: 'detail', visible: true },
  },
  {
    state: 'long text, wraps',
    stage: 'flex justify-center pt-2800',
    tooltip: { ...pinned, visible: true },
    text: 'Il verbale firmato digitalmente, con gli allegati della seduta e il protocollo di uscita',
  },
  {
    // the tooltip is the only name of an icon-only button
    state: 'label of an icon-only button',
    stage: roomOf('top'),
    caller: { icon: 'mi/baseline/delete', variant: 'dark', tone: 'text' },
    tooltip: { ...pinned, relation: 'label', visible: true },
    text: 'Elimina la pratica',
  },
  {
    state: 'strategy absolute',
    stage: roomOf('top'),
    tooltip: { ...pinned, strategy: 'absolute', visible: true },
  },
  { state: 'shown by the pointer', play: true, stage: roomOf('top'), tooltip: pinned },
  { state: 'shown by the keyboard focus', play: true, stage: roomOf('top'), tooltip: pinned },
  { state: 'hidden with Escape', play: true, stage: roomOf('top'), tooltip: pinned },
];

const TemplateStates = () => (
  <StatesGrid>
    {tooltipStates.map(({ state, play, stage, caller, tooltip, text }, index) => (
      <StateCell key={state} state={state} play={play}>
        <div class={stage}>
          <mds-button id={`tooltip-state-${index}`} {...(caller ?? download)}></mds-button>
          <mds-tooltip target={`#tooltip-state-${index}`} {...tooltip}>
            {text ?? tooltipText}
          </mds-tooltip>
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

/** The caller and the tooltip of a cell, once every Magma element of the cell has loaded. */
const loadedTooltip = async (canvasElement: HTMLElement, state: string) => {
  const cell = stateCell(canvasElement, state);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  return {
    caller: cell.querySelector('mds-button') as HTMLMdsButtonElement,
    tooltip: cell.querySelector('mds-tooltip') as HTMLMdsTooltipElement,
  };
};

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  // the tooltip listens to the caller itself: a mouseenter sent to it is the pointer entering
  const hovered = await loadedTooltip(canvasElement, 'shown by the pointer');
  hovered.caller.dispatchEvent(new MouseEvent('mouseenter'));

  const escaped = await loadedTooltip(canvasElement, 'hidden with Escape');
  escaped.caller.dispatchEvent(new MouseEvent('mouseenter'));
  await waitFor(() => expect(escaped.tooltip).toHaveProperty('visible', true));
  escaped.caller.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
  );

  // a focus the browser rings, as the one of the keyboard: a script focus with no click before it.
  // The page is not scrolled to it: a scroll moves the tooltips of auto-placement
  const focused = await loadedTooltip(canvasElement, 'shown by the keyboard focus');
  focused.caller.focus({ preventScroll: true });

  // the property, not the attribute: Stencil reflects it on the next frame, and a hidden page
  // draws no frame
  await waitFor(() => expect(hovered.tooltip).toHaveProperty('visible', true));
  await waitFor(() => expect(escaped.tooltip).toHaveProperty('visible', false));
  await waitFor(() => expect(focused.tooltip).toHaveProperty('visible', true));
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
