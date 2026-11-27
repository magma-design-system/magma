import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';
import { sizesDictionary } from '../meta/dictionary';

export default {
  title: 'UI / Data / Avatar stack',
  id: 'ui-avatar-stack',
  argTypes: {
    size: {
      type: { name: 'string' },
      description: '',
      options: sizesDictionary,
      control: { type: 'select' },
    },
    total: {
      type: { name: 'number' },
      description: '',
    },
  },
};

const Template = (args) => (
  <mds-avatar-stack {...args}>
    <mds-avatar-stack-item initials="mr" tone="weak"></mds-avatar-stack-item>
    <mds-avatar-stack-item initials="ac" tone="weak"></mds-avatar-stack-item>
    <mds-avatar-stack-item initials="er" tone="weak"></mds-avatar-stack-item>
    <mds-avatar-stack-item initials="mt" tone="weak"></mds-avatar-stack-item>
    <mds-avatar-stack-item initials="jb" tone="weak"></mds-avatar-stack-item>
  </mds-avatar-stack>
);

export const Default = {
  render: Template,
};

export const Size = {
  render: Template,

  args: {
    size: 'lg',
    total: 8,
  },
};

export const Total = {
  render: Template,

  args: {
    total: 8,
  },
};

/**
 * Every state the stack has of its own once the story has opened (#1440, @fixture/states): its
 * three sizes, the counter of the people `total` has beyond the avatars (in each size), no counter
 * when `total` is not over them, few and many avatars, photos and initials together. The look of
 * one avatar (tone, variant, image, count set by hand) is in the story of mds-avatar-stack-item.
 * The avatar added after load (`play: true`) is appended by the play function, which checks that
 * the counter took it off the people left: the `count` of the counter, not its look.
 */
interface StackState {
  state: string;
  play?: boolean;
  stack: Record<string, string | number>;
  items: Record<string, string>[];
}

const team = [
  { initials: 'MR' },
  { initials: 'GB' },
  { initials: 'LV' },
  { initials: 'AC' },
  { initials: 'FN' },
];
const photos = [
  { src: './avatar-01-200x200.jpeg', initials: 'MR' },
  { src: './avatar-03-200x200.jpeg', initials: 'GB' },
  { src: './avatar-04-200x200.jpeg', initials: 'LV' },
];
const added = 'an avatar added after load';

const stackStates: StackState[] = [
  { state: 'size sm', stack: { size: 'sm' }, items: team },
  { state: 'size md', stack: { size: 'md' }, items: team },
  { state: 'size lg', stack: { size: 'lg' }, items: team },
  { state: 'no size (the item default, md)', stack: {}, items: team },
  { state: 'total over the avatars, counter', stack: { total: 8 }, items: team },
  { state: 'counter, size sm', stack: { size: 'sm', total: 8 }, items: team },
  { state: 'counter, size lg', stack: { size: 'lg', total: 8 }, items: team },
  { state: 'counter over 99', stack: { total: 128 }, items: team },
  { state: 'total equal to the avatars, no counter', stack: { total: 5 }, items: team },
  { state: 'total under the avatars, no counter', stack: { total: 3 }, items: team },
  { state: 'one avatar', stack: {}, items: team.slice(0, 1) },
  { state: 'two avatars', stack: {}, items: team.slice(0, 2) },
  { state: 'one avatar and a counter', stack: { total: 14 }, items: team.slice(0, 1) },
  {
    state: 'photos, initials and a counter',
    stack: { total: 9 },
    items: [...photos, ...team.slice(3)],
  },
  { state: added, play: true, stack: { total: 8 }, items: team },
];

const TemplateStates = () => (
  <StatesGrid>
    {stackStates.map(({ state, play, stack, items }) => (
      <StateCell key={state} state={state} play={play}>
        <div class="flex">
          <mds-avatar-stack {...stack}>
            {items.map((item) => (
              <mds-avatar-stack-item key={item.initials} {...item}></mds-avatar-stack-item>
            ))}
          </mds-avatar-stack>
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const stack = stateCell(canvasElement, added).querySelector(
    'mds-avatar-stack',
  ) as HTMLMdsAvatarStackElement;
  const counter = () =>
    stack.shadowRoot!.querySelector('mds-avatar-stack-item') as HTMLMdsAvatarStackItemElement;
  await waitFor(() => expect(counter()).toHaveProperty('count', 3));
  const item = document.createElement('mds-avatar-stack-item');
  item.setAttribute('initials', 'SP');
  stack.append(item);
  await waitFor(() => expect(counter()).toHaveProperty('count', 2));
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
