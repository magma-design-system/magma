import { h } from '@stencil/core';
import { themeFullVariantAvatarDictionary } from '@type/variant';
import { toneMinimalVariantDictionary } from '@type/tone';

export default {
  title: 'UI / Avatar stack / Item',
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
