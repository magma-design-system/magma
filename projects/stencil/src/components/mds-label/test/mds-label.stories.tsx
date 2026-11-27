import { typographyTooltipDictionary } from '@type/typography';
import { themeLabelVariantDictionary } from '@type/variant';
import { toneSimpleVariantDictionary } from '@type/tone';

import { h } from '@stencil/core';
import { truncateDictionary } from '@type/text';
import { StateCell, StatesGrid } from '@fixture/states';

export default {
  title: 'UI / Tags / Label',
  id: 'ui-label',
  argTypes: {
    deletable: {
      type: { name: 'boolean' },
      description: 'Enables the cross icon to perform cancel/delete action on element',
    },
    label: {
      type: { name: 'string' },
      description: 'The label of the component',
    },
    truncate: {
      type: { name: 'string' },
      control: { type: 'select' },
      options: truncateDictionary,
      description: 'Truncates text inside the tag or displays it in multiline if needed',
    },
    typography: {
      type: { name: 'string' },
      control: { type: 'select' },
      description: 'Specifies the font typography of the element',
      options: typographyTooltipDictionary,
    },
    tone: {
      type: { name: 'string' },
      control: { type: 'select' },
      description: 'Sets the tone of the color variant',
      options: toneSimpleVariantDictionary,
    },
    variant: {
      type: { name: 'string' },
      control: { type: 'select' },
      description: 'Sets the theme variant colors',
      options: themeLabelVariantDictionary,
    },
  },
};
const Template = (args) => <mds-label {...args}></mds-label>;

export const Default = {
  render: Template,
  args: {
    label: 'This is a text label',
  },
};

export const Truncate = {
  render: Template,

  args: {
    truncate: 'word',
    label: 'This is a very long text that should be truncated',
    class: 'w-3200',
  },
};

export const Typography = {
  render: Template,

  args: {
    typography: 'caption',
    label: 'This is a text label',
  },
};

export const OnClickClose = {
  render: Template,

  args: {
    deletable: true,
    label: 'This is a text label',
    // onClickClose: event => { console.info(event, 'hello') },
  },
};

/**
 * Every state of the label once the story has opened (#1440, @fixture/states): each variant in
 * both tones (weak, the default, then strong), without and with the close button, since the
 * variant paints the button too; the three typographies; the three ways a long text is handled
 * (`truncate` word, the default, all and none) in a narrow column, one label under the other as
 * the usage docs give it its width, with and without the close button; and the long text in a
 * row of tags, where a product lists them: two that wrap share the row, and one cut to its line,
 * last because it is wider than its column and, last, covers no other cell. The label says what
 * each variant says in a product: an outcome for the status variants, a category for the label
 * variants. The close button emits `mdsLabelDelete` and leaves the label as it is (the product
 * removes it), and its tint under the pointer needs a real pointer, which a play does not move:
 * no state needs an interaction, so the story has no play function.
 */
interface LabelState {
  state: string;
  /** the labels one under the other in a narrow column, instead of a row of tags */
  column?: boolean;
  /** the width the labels are given, for the long text */
  width?: string;
  labels: Record<string, string | boolean>[];
}

// the label each variant takes in a product: what the variant says
const labelVariants: [string, string][] = [
  ['success', 'Approvato'],
  ['info', 'Informazione'],
  ['warning', 'In attesa'],
  ['error', 'Rifiutato'],
  ['sky', 'Bozza'],
  ['amaranth', 'Cultura'],
  ['aqua', 'Clima'],
  ['blue', 'Tecnologia'],
  ['green', 'Ambiente'],
  ['lime', 'Agricoltura'],
  ['orange', 'Sport'],
  ['orchid', 'Famiglia'],
  ['purple', 'Istruzione'],
  ['red', 'Urbanistica'],
  ['violet', 'Design'],
  ['yellow', 'Parchi'],
];

const longText = 'Richiesta di integrazione documentale per la pratica edilizia n. 2024/118';

const labelStates: LabelState[] = [
  ...labelVariants.map(([variant, label]): LabelState => ({
    state: `variant ${variant}${variant === 'sky' ? ' (default)' : ''} (weak, strong; deletable)`,
    labels: [
      { variant, label },
      { variant, label, tone: 'strong' },
      { variant, label, deletable: true },
      { variant, label, tone: 'strong', deletable: true },
    ],
  })),
  {
    state: 'typography caption (default)',
    labels: [{ label: 'Categoria', typography: 'caption' }],
  },
  { state: 'typography detail', labels: [{ label: 'Categoria', typography: 'detail' }] },
  { state: 'typography tip', labels: [{ label: 'Categoria', typography: 'tip' }] },
  {
    state: 'long text, truncate word (default), in a narrow column',
    column: true,
    width: 'max-w-4800',
    labels: [{ label: longText }, { label: longText, deletable: true }],
  },
  {
    state: 'long text, truncate all, in a narrow column',
    column: true,
    width: 'max-w-4800',
    labels: [
      { label: longText, truncate: 'all' },
      { label: longText, truncate: 'all', deletable: true },
    ],
  },
  {
    state: 'long text, truncate none, in a narrow column',
    column: true,
    width: 'max-w-4800',
    labels: [
      { label: longText, truncate: 'none' },
      { label: longText, truncate: 'none', deletable: true },
    ],
  },
  {
    state: 'long text, truncate none, two in a row of tags',
    width: 'max-w-4800',
    labels: [
      { label: longText, truncate: 'none' },
      { label: longText, truncate: 'none', deletable: true },
    ],
  },
  {
    state: 'long text, truncate word (default), in a row of tags',
    width: 'max-w-4800',
    labels: [{ label: longText, deletable: true }],
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {labelStates.map(({ state, column, width, labels }) => (
      <StateCell key={state} state={state}>
        <div
          class={`flex gap-200 ${column ? 'flex-col' : 'flex-wrap items-center'}${width ? ` ${width}` : ''}`}
        >
          {labels.map((props, index) => (
            <mds-label key={String(index)} {...props}></mds-label>
          ))}
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
