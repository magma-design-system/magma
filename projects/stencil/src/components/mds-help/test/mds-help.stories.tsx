import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';
import { iconsDictionary, mggIconsDictionary } from '@type/icon';

export default {
  title: 'UI / Overlays / Help',
  id: 'ui-help',
  argTypes: {
    icon: {
      type: { name: 'string' },
      description:
        'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: mggIconsDictionary.concat(iconsDictionary),
      control: { type: 'select' },
    },
  },
};

const Template = (args) => (
  <mds-text>
    We are available 24/7!
    <mds-help {...args} class="ml-100">
      Well, maybe it's more a 24/5, because we are colsed on saturday and sunday.
    </mds-help>
  </mds-text>
);

export const Default = {
  render: Template,
};

export const CustomIcon = {
  render: Template,

  args: {
    icon: 'mi/baseline/warning',
  },
};

/**
 * Every state of the help once the story has opened (#1440, @fixture/states), each next to the
 * words it explains and in the room its tooltip opens into, so that no tooltip covers another
 * cell. The help has no property that opens it: its tooltip opens on the pointer over the icon or
 * on a focus the keyboard gives it, so every open state is reached by the play function
 * (`play: true`), which checks `visible` on the tooltip, not the look. The open cells do not close
 * each other: each tooltip hears its own icon only, and only one cell takes the focus.
 *
 * The placements are the four sides, pinned with `disable-auto-placement` so that a cell shows its
 * own: the alignments (`top-start`, `left-end`...) belong to mds-tooltip and are in its States
 * story. The help cannot turn off the shift of its tooltip, which answers to the viewport: the
 * side placements sit in the first rows, inside the screen, where the shift has nothing to move.
 */
interface HelpState {
  state: string;
  play?: boolean;
  // the room of the cell the tooltip opens into, and where the words stand in it
  stage: string;
  help?: Record<string, string | boolean>;
  text?: string;
}

const helpText = 'Sedici caratteri, sulla tessera sanitaria';
const helpPinned = { 'disable-auto-placement': true };

const helpStates: HelpState[] = [
  { state: 'rest', stage: 'flex justify-center pt-2000' },
  {
    state: 'custom icon',
    stage: 'flex justify-center pt-2000',
    help: { icon: 'mi/baseline/info' },
  },
  { state: 'open, top (default)', play: true, stage: 'flex justify-center pt-2000' },
  {
    state: 'open, left',
    play: true,
    stage: 'flex justify-end py-800',
    help: { ...helpPinned, placement: 'left' },
  },
  {
    state: 'open, right',
    play: true,
    stage: 'flex justify-start py-800',
    help: { ...helpPinned, placement: 'right' },
  },
  {
    state: 'open, bottom',
    play: true,
    stage: 'flex justify-center pb-2000',
    help: { ...helpPinned, placement: 'bottom' },
  },
  {
    state: 'open, long text',
    play: true,
    stage: 'flex justify-center pt-3000',
    help: helpPinned,
    text: "Il codice fiscale del legale rappresentante, non la partita IVA dell'ente: lo trovi sulla tessera sanitaria",
  },
  {
    state: 'open by the keyboard focus',
    play: true,
    stage: 'flex justify-center pt-2000',
    help: helpPinned,
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {helpStates.map(({ state, play, stage, help, text }) => (
      <StateCell key={state} state={state} play={play}>
        <div class={stage}>
          <mds-text typography="detail">
            Codice fiscale
            <mds-help {...help}>{text ?? helpText}</mds-help>
          </mds-text>
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

/** The icon and the tooltip of the help of a cell, once every Magma element of it has loaded. */
const loadedHelp = async (canvasElement: HTMLElement, state: string) => {
  const help = stateCell(canvasElement, state).querySelector('mds-help') as HTMLMdsHelpElement;
  const shadow = () => help.shadowRoot!;
  await waitFor(() => expect(help).toHaveAttribute('hydrated'));
  await waitFor(() =>
    shadow()
      .querySelectorAll('mds-icon, mds-tooltip')
      .forEach((element) => expect(element).toHaveAttribute('hydrated')),
  );
  return {
    icon: shadow().querySelector('.icon') as HTMLMdsIconElement,
    tooltip: shadow().querySelector('mds-tooltip') as HTMLMdsTooltipElement,
  };
};

const pointedStates = ['open, top (default)', 'open, left', 'open, right', 'open, bottom'];

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  // the tooltip listens to the icon itself: a mouseenter sent to it is the pointer entering
  const pointed = await Promise.all(
    [...pointedStates, 'open, long text'].map((state) => loadedHelp(canvasElement, state)),
  );
  pointed.forEach(({ icon }) => icon.dispatchEvent(new MouseEvent('mouseenter')));

  // a focus the browser rings, as the one of the keyboard: a script focus with no click before
  // it. The page is not scrolled to it: a scroll moves the tooltips of auto-placement
  const focused = await loadedHelp(canvasElement, 'open by the keyboard focus');
  focused.icon.focus({ preventScroll: true });

  // the property, not the attribute: Stencil reflects it on the next frame, and a hidden page
  // draws no frame
  for (const { tooltip } of [...pointed, focused]) {
    await waitFor(() => expect(tooltip).toHaveProperty('visible', true));
  }
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
