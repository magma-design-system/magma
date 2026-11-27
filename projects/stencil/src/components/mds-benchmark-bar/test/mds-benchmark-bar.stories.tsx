import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';
import { themeVariantDictionary } from '@type/variant';
import { benchmarkBarTypographyDictionary } from '../meta/dictionary';
import { progressBarSizeDictionary } from '@type/progress';

export default {
  title: 'UI / Data / Benchmark Bar',
  id: 'ui-benchmark-bar',
  argTypes: {
    label: {
      type: { name: 'string' },
      control: { type: 'text' },
      description: 'The label of the benchmark bar',
    },
    alias: {
      type: { name: 'string' },
      description: 'An alias to custom how value is represented',
    },
    typography: {
      type: { name: 'string' },
      description: 'Sets the theme variant colors',
      options: benchmarkBarTypographyDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string' },
      description: 'Sets the theme variant colors',
      options: themeVariantDictionary,
      control: { type: 'select' },
    },
    size: {
      type: { name: 'string' },
      description: 'Sets the size of the component',
      options: progressBarSizeDictionary,
      control: { type: 'select' },
    },
    value: {
      control: { type: 'range', step: 1, min: 0, max: 100 },
      type: { name: 'number' },
      description: 'A value between 0 and 100 that rapresents the benchmark',
    },
  },
};

const Template = (args) => <mds-benchmark-bar {...args}></mds-benchmark-bar>;

export const Default = {
  render: Template,

  args: {
    label: 'This is a benchmark bar that will be cropped if the text is too long',
    value: 30,
  },
};

export const Alias = {
  render: Template,

  args: {
    label: 'This is a benchmark bar that will be cropped if the text is too long',
    value: 33,
    alias: '1 of 3 tasks',
  },
};

export const Typography = {
  render: Template,

  args: {
    label: 'This is a benchmark bar that will be cropped if the text is too long',
    typography: 'option',
  },
};

/**
 * Every state of the benchmark bar once the story has opened (#1440, @fixture/states): the value
 * at its ends (0 and 100) and between, the alias that replaces the number, both typographies,
 * every variant (dark is the default; light is painted for a dark ground, so it sits on the
 * inverse surface, as on a dark band of a product), every size, the long label cut by its
 * truncation and the label written in the deprecated slot. The bar is read only: no state needs
 * an interaction.
 */
interface BarState {
  state: string;
  /** the inverse surface, for the variant painted for a dark ground */
  inverse?: boolean;
  /** the label in the deprecated default slot instead of `label` */
  slotted?: string;
  bar: Record<string, string | number>;
}

const label = 'Pratiche chiuse nei termini';
const barVariants = ['dark', 'primary', 'ai', 'info', 'success', 'warning', 'error', 'light'];

const barStates: BarState[] = [
  { state: 'value', bar: { label, value: 64 } },
  { state: 'value 0', bar: { label, value: 0 } },
  { state: 'value 100', bar: { label, value: 100 } },
  { state: 'alias', bar: { label, value: 33, alias: '1 di 3 pratiche' } },
  { state: 'typography label (default)', bar: { label, value: 64, typography: 'label' } },
  { state: 'typography option', bar: { label, value: 64, typography: 'option' } },
  ...barVariants.map((variant) => ({
    state: `variant ${variant}${variant === 'dark' ? ' (default)' : ''}`,
    inverse: variant === 'light',
    bar: { label, value: 64, variant },
  })),
  ...['sm', 'md', 'lg', 'xl'].map((size) => ({
    state: `size ${size}${size === 'md' ? ' (default)' : ''}`,
    bar: { label, value: 64, size },
  })),
  {
    state: 'long label, truncated',
    bar: {
      label:
        'Pratiche edilizie chiuse entro i termini di legge nel trimestre, comprese le varianti in corso d opera',
      value: 48,
      alias: '48 per cento',
    },
  },
  { state: 'label in the slot (deprecated)', slotted: label, bar: { value: 64 } },
];

const TemplateStates = () => (
  <StatesGrid>
    {barStates.map(({ state, inverse, slotted, bar }) => (
      <StateCell key={state} state={state}>
        <div class={inverse ? 'bg-surface-inverse text-on-inverse p-400 rounded-lg' : undefined}>
          <mds-benchmark-bar {...bar}>{slotted}</mds-benchmark-bar>
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
