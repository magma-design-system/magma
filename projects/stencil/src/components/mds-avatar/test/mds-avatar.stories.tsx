import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';
import { iconsDictionary, mggIconsDictionary } from '@type/icon';
import { themeFullVariantAvatarDictionary } from '@type/variant';
import { toneMinimalVariantDictionary } from '@type/tone';

export default {
  title: 'UI / Data / Avatar',
  id: 'ui-avatar',
  argTypes: {
    icon: {
      type: { name: 'string' },
      description:
        'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: mggIconsDictionary.concat(iconsDictionary),
      control: { type: 'select' },
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

const Template = (args) => <mds-avatar {...args} class="w-2400" />;

const TemplateSmall = (args) => <mds-avatar {...args} class="w-600" />;

export const Default = {
  render: Template,

  args: {
    src: './avatar-06-200x200.jpeg',
  },
};

export const NoImage = {
  render: Template,
  args: {},
};

export const Initials = {
  render: Template,

  args: {
    initials: 'ts',
  },
};

export const InitialsSmall = {
  render: TemplateSmall,

  args: {
    initials: 'ts',
  },
};

export const Icon = {
  render: Template,

  args: {
    icon: 'mi/baseline/pets',
  },
};

export const BrokenSrc = {
  render: Template,

  args: {
    src: 'http://broken-link',
  },
};

/**
 * Every state of the avatar once the story has opened (#1440, @fixture/states): each source it
 * shows (the image, the initials, one letter, the count, the icon, the person glyph when nothing
 * is set) and the source it falls back to when the image fails to load, the sizes that change its
 * drawing (the initials of a 24px avatar), both tones of every variant, drawn on the person glyph
 * because initials pick their own colour, and the colour that the initials derive. The image that
 * fails is an empty data URL, so it fails at once and with no request: a remote or a missing file
 * would ask the network. The image still loading (`avatar--pending`) lasts as long as the request,
 * which a local file does not hold open: no story shows it. No state needs an interaction.
 */
interface AvatarState {
  state: string;
  /** the avatars of the cell, side by side */
  avatars: Record<string, string | number>[];
  /** the width class of each avatar, the default (48px) without */
  size?: string;
}

const photo = './avatar-06-200x200.jpeg';
// an image that fails to load at once, with no request
const broken = 'data:,';

const avatarVariants = [
  'primary',
  'amaranth',
  'red',
  'aqua',
  'blue',
  'green',
  'lime',
  'orange',
  'orchid',
  'purple',
  'sky',
  'violet',
  'yellow',
  'error',
  'info',
  'success',
  'warning',
];

const avatarStates: AvatarState[] = [
  { state: 'image', avatars: [{ src: photo }] },
  { state: 'initials', avatars: [{ initials: 'MR' }] },
  { state: 'initials, one letter', avatars: [{ initials: 'M' }] },
  {
    state: 'initials, colour derived from the letters',
    avatars: [{ initials: 'MR' }, { initials: 'GB' }, { initials: 'LV' }, { initials: 'AC' }],
  },
  { state: 'initials ignore the variant', avatars: [{ initials: 'MR', variant: 'green' }] },
  { state: 'count', avatars: [{ count: 12 }] },
  { state: 'icon', avatars: [{ icon: 'mi/baseline/account-balance' }] },
  { state: 'nothing set, person glyph', avatars: [{}] },
  { state: 'count over the image', avatars: [{ count: 3, src: photo }] },
  {
    state: 'image over initials and icon',
    avatars: [{ src: photo, initials: 'MR', icon: 'mi/baseline/pets' }],
  },
  { state: 'image failed, initials', avatars: [{ src: broken, initials: 'MR' }] },
  { state: 'image failed, icon', avatars: [{ src: broken, icon: 'mi/baseline/account-balance' }] },
  { state: 'image failed, person glyph', avatars: [{ src: broken }] },
  {
    state: 'size 24px (image, initials, count, icon, glyph)',
    size: 'w-600',
    avatars: [{ src: photo }, { initials: 'MR' }, { count: 12 }, { icon: 'mi/baseline/pets' }, {}],
  },
  {
    state: 'size 96px (image, initials, count, icon, glyph)',
    size: 'w-2400',
    avatars: [{ src: photo }, { initials: 'MR' }, { count: 12 }, { icon: 'mi/baseline/pets' }, {}],
  },
  ...avatarVariants.map((variant) => ({
    state: `variant ${variant} (strong, weak)`,
    avatars: [
      { variant, tone: 'strong' },
      { variant, tone: 'weak' },
    ],
  })),
  {
    state: 'count, variant info (strong, weak)',
    avatars: [
      { count: 12, variant: 'info', tone: 'strong' },
      { count: 12, variant: 'info', tone: 'weak' },
    ],
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {avatarStates.map(({ state, avatars, size }) => (
      <StateCell key={state} state={state}>
        <div class="flex flex-wrap items-center gap-400">
          {avatars.map((avatar, index) => (
            <mds-avatar key={index} {...avatar} class={size}></mds-avatar>
          ))}
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
