import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';
import { typographyTechnicalDictionary } from '@type/typography';
import { themeVariantDictionary } from '@type/variant';
import { iconsDictionary } from '@type/icon';

export default {
  title: 'UI / Feedback / Radial Progress',
  id: 'ui-radial-progress',
  argTypes: {
    typography: {
      type: { name: 'string' },
      description: 'Specifies the typography of the element',
      options: typographyTechnicalDictionary,
      control: { type: 'select' },
    },
    progress: {
      type: { name: 'number' },
      control: { type: 'range', step: 0.01, min: 0, max: 1 },
      description: 'Specifies the progress of the radial progress',
    },
    icon: {
      type: { name: 'string' },
      description: 'Specifies the icon of the element',
      control: { type: 'select' },
      options: iconsDictionary,
    },
    variant: {
      type: { name: 'string' },
      description: 'Specifies the variant of the element',
      options: themeVariantDictionary,
      control: { type: 'select' },
    },
    width: {
      description: 'Just for testing purposes',
      control: { type: 'range', defaultValue: 48, min: 16, max: 328, step: 1 },
      type: { name: 'number' },
    },
  },
};

const Template = (args) => (
  <mds-radial-progress
    aria-label="Progress"
    {...args}
    style={{ width: `${args.width}px` }}
  ></mds-radial-progress>
);

export const Default = {
  render: Template,
  args: {
    width: 48,
    progress: 0.65,
  },
};

/**
 * Every state of the ring once the story has opened (#1440, @fixture/states), each named by
 * `aria-label` as a product names it. The values are fixed: the ring is drawn at its value from
 * the first render, and only a later change of `progress` moves it (a 500ms tween, none with a
 * reduced animation), so the story sets no timer and has no play function. A value outside 0..1
 * is drawn and written at its nearest end. The width is the product's (`w-*` on the host, 48px by
 * default): under it the container queries of the ring take away first the text beside an icon,
 * then the `%`, then the value; the widths are the ones on each side of those steps.
 */
interface RadialState {
  state: string;
  props: Record<string, string | number>;
}

const radialStates: RadialState[] = [
  { state: 'start, progress 0', props: { progress: 0 } },
  { state: 'progress 0.65', props: { progress: 0.65 } },
  { state: 'complete, progress 1', props: { progress: 1 } },
  { state: 'over the end, progress 1.4', props: { progress: 1.4 } },
  ...themeVariantDictionary.map((variant) => ({
    state: variant === 'primary' ? 'variant primary (default)' : `variant ${variant}`,
    props: { progress: 0.65, variant },
  })),
  { state: 'typography option (default), 48px', props: { progress: 0.65 } },
  {
    state: 'typography label, 48px, no %',
    props: { progress: 0.65, typography: 'label' },
  },
  {
    state: 'typography label, 96px',
    props: { progress: 0.65, typography: 'label', class: 'w-2400' },
  },
  { state: 'icon, 48px, no value', props: { progress: 0.65, icon: 'mi/baseline/description' } },
  {
    state: 'icon, 96px, icon and value',
    props: { progress: 0.65, icon: 'mi/baseline/description', class: 'w-2400' },
  },
  { state: '160px', props: { progress: 0.65, class: 'w-4000' } },
  { state: '40px, no %', props: { progress: 0.65, class: 'w-1000' } },
  { state: '32px, no value', props: { progress: 0.65, class: 'w-800' } },
];

const TemplateStates = () => (
  <StatesGrid>
    {radialStates.map(({ state, props }) => (
      <StateCell key={state} state={state}>
        <mds-radial-progress aria-label="Profilo completato" {...props}></mds-radial-progress>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
