import { h } from '@stencil/core';
import { iconsDictionary } from '@type/icon';
import { mentionSizeDictionary } from '../meta/dictionary';
import { StateCell, StatesGrid } from '@fixture/states';

export default {
  title: 'UI / Tags / Mention',
  id: 'ui-mention',
  argTypes: {
    deletable: {
      type: { name: 'boolean' },
      description:
        'Shows the remove button; its click emits `mdsMentionDelete` with the mention element',
      control: { type: 'boolean' },
    },
    icon: {
      type: { name: 'string' },
      description:
        'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    label: {
      type: { name: 'string' },
      description: 'The label of the component',
    },
    size: {
      type: { name: 'string' },
      description: 'The size of the component',
      options: mentionSizeDictionary,
      control: { type: 'select' },
    },
  },
};

const Template = (args) => (
  <mds-text>
    Ciao <mds-mention {...args}></mds-mention>, sei riuscito poi a inviare il messaggio?
  </mds-text>
);

export const Default = {
  render: Template,

  args: {
    label: 'mario.rossi',
  },
};

export const Deletable = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <mds-mention {...args} size="sm"></mds-mention>
      <mds-mention {...args} size="md"></mds-mention>
      <mds-mention {...args} size="lg"></mds-mention>
    </div>
  ),

  args: {
    deletable: true,
    label: 'mario.rossi',
  },
};

/**
 * Every state of the mention once the story has opened (#1440, @fixture/states): the three sizes
 * with the default `@` glyph, with an icon of its own, with the remove button and with both, the
 * long label, and the mention in the flow of a sentence, alone and several in a narrow column
 * where the text wraps around them. The remove button emits `mdsMentionDelete` and leaves the
 * mention as it is (the product removes it), so no state needs an interaction and the story has
 * no play function. The mention has no disabled, selected or variant state.
 */
interface MentionState {
  state: string;
  /** the mentions in the flow of a sentence, instead of alone */
  sentence?: boolean;
  /** the width the cell gives, for the text that wraps */
  width?: string;
  mentions: Record<string, string | boolean>[];
}

const sizes = ['sm', 'md', 'lg'];
const everySize = (mention: Record<string, string | boolean>): Record<string, string | boolean>[] =>
  sizes.map((size) => ({ ...mention, size }));

const mentionStates: MentionState[] = [
  { state: 'size sm (default)', mentions: [{ label: 'mario.rossi', size: 'sm' }] },
  { state: 'size md', mentions: [{ label: 'mario.rossi', size: 'md' }] },
  { state: 'size lg', mentions: [{ label: 'mario.rossi', size: 'lg' }] },
  {
    state: 'icon of its own (sm, md, lg)',
    mentions: everySize({ label: 'ufficio.tributi', icon: 'mi/baseline/account-balance' }),
  },
  {
    state: 'deletable (sm, md, lg)',
    mentions: everySize({ label: 'mario.rossi', deletable: true }),
  },
  {
    state: 'icon of its own, deletable (sm, md, lg)',
    mentions: everySize({ label: 'lucia.ferrari', icon: 'mi/baseline/person', deletable: true }),
  },
  {
    state: 'long label',
    mentions: [
      { label: 'francesca.dellavalle.martinelli' },
      { label: 'francesca.dellavalle.martinelli', deletable: true },
    ],
  },
  { state: 'in a sentence', sentence: true, mentions: [{ label: 'mario.rossi' }] },
  {
    state: 'several in a sentence, in a narrow column',
    sentence: true,
    width: 'max-w-6400',
    mentions: [
      { label: 'marco.bianchi' },
      { label: 'giulia.conti', icon: 'mi/baseline/person' },
      { label: 'ufficio.tributi', icon: 'mi/baseline/account-balance', deletable: true },
    ],
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {mentionStates.map(({ state, sentence, width, mentions }) => {
      const tokens = mentions.map((props, index) => (
        <mds-mention key={String(index)} {...props}></mds-mention>
      ));
      return (
        <StateCell key={state} state={state}>
          {sentence ? (
            <mds-text class={width}>
              {mentions.length === 1 ? (
                <span>Ciao {tokens[0]}, sei riuscito poi a inviare il messaggio?</span>
              ) : (
                <span>
                  {tokens[0]} e {tokens[1]} sono stati assegnati alla revisione della pratica, in
                  copia {tokens[2]} per il calcolo dei tributi dovuti.
                </span>
              )}
            </mds-text>
          ) : (
            <div class="flex flex-wrap items-center gap-200">{tokens}</div>
          )}
        </StateCell>
      );
    })}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
