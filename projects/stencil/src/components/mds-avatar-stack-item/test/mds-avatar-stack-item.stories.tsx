import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';
import { themeFullVariantAvatarDictionary } from '@type/variant';
import { toneMinimalVariantDictionary } from '@type/tone';

export default {
  title: 'UI / Data / Avatar stack / Item',
  id: 'ui-avatar-stack-item',
  argTypes: {
    count: {
      type: { name: 'number' },
      description: "The user's inizials displayed if there's no image available",
    },
    initials: {
      type: { name: 'string' },
      description: "The user's inizials displayed if there's no image available",
    },
    src: {
      type: { name: 'string' },
      description: 'The URL of the avatar image',
    },
    tone: {
      type: { name: 'string' },
      description: 'Specifies the tone variant of the component',
      options: toneMinimalVariantDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string' },
      description: 'Specifies the variant of the component',
      options: themeFullVariantAvatarDictionary,
      control: { type: 'select' },
    },
  },
};

const Template = (args) => (
  <mds-avatar-stack>
    <mds-avatar-stack-item initials="mr" tone="weak"></mds-avatar-stack-item>
    <mds-avatar-stack-item initials="ac" tone="weak"></mds-avatar-stack-item>
    <mds-avatar-stack-item initials="er" tone="weak"></mds-avatar-stack-item>
    <mds-avatar-stack-item initials="mt" tone="weak"></mds-avatar-stack-item>
    <mds-avatar-stack-item {...args}></mds-avatar-stack-item>
  </mds-avatar-stack>
);

export const Default = {
  render: Template,

  args: {
    initials: 'el',
  },
};

export const Count = {
  render: Template,

  args: {
    initials: 'el',
    count: 8,
  },
};

export const Tone = {
  render: Template,

  args: {
    initials: 'el',
    tone: 'strong',
  },
};

export const Variant = {
  render: Template,

  args: {
    initials: 'el',
    variant: 'blue',
  },
};

/**
 * Every state an item has of its own once the story has opened (#1440, @fixture/states), each in
 * a stack of its own, three items alike so the overlap and its ring show: initials in the weak
 * tone it starts from and in the strong one, the photo, the person glyph when nothing is set, each
 * variant on the glyph in both tones (initials pick their own colour and leave the variant out),
 * and the count set by hand, which takes the neutral wash of the counter. The sizes, the counter
 * of `total` and the avatars added later belong to the stack: they are in the story of
 * mds-avatar-stack. No state needs an interaction.
 */
interface ItemState {
  state: string;
  items: Record<string, string | number>[];
}

const initials = ['MR', 'GB', 'LV'];
const itemVariants = [
  'primary',
  'blue',
  'green',
  'orange',
  'violet',
  'error',
  'warning',
  'success',
  'info',
];

const itemStates: ItemState[] = [
  { state: 'initials, tone weak (default)', items: initials.map((value) => ({ initials: value })) },
  {
    state: 'initials, tone strong',
    items: initials.map((value) => ({ initials: value, tone: 'strong' })),
  },
  {
    state: 'photo',
    items: [
      { src: './avatar-01-200x200.jpeg', initials: 'MR' },
      { src: './avatar-03-200x200.jpeg', initials: 'GB' },
      { src: './avatar-04-200x200.jpeg', initials: 'LV' },
    ],
  },
  { state: 'nothing set, person glyph (weak, strong)', items: [{}, { tone: 'strong' }] },
  ...itemVariants.map((variant): ItemState => ({
    state: `variant ${variant}, glyph (weak, strong)`,
    items: [{ variant }, { variant, tone: 'strong' }],
  })),
  {
    state: 'initials ignore the variant',
    items: initials.map((value) => ({ initials: value, variant: 'green' })),
  },
  { state: 'count set by hand', items: [{ initials: 'MR' }, { initials: 'GB' }, { count: 6 }] },
  { state: 'count over 99', items: [{ initials: 'MR' }, { count: 240 }] },
];

const TemplateStates = () => (
  <StatesGrid>
    {itemStates.map(({ state, items }) => (
      <StateCell key={state} state={state}>
        <div class="flex">
          <mds-avatar-stack>
            {items.map((item, index) => (
              <mds-avatar-stack-item key={index} {...item}></mds-avatar-stack-item>
            ))}
          </mds-avatar-stack>
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
