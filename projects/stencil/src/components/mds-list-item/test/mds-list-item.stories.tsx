import { typographyInfoDictionary, typographyReadingVariationsDictionary } from '@type/typography';
import { iconsDictionary } from '@type/icon';
import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';

export default {
  title: 'UI / Data / List / List Item',
  id: 'ui-list-list-item',
  argTypes: {
    icon: {
      type: { name: 'string', required: true },
      description:
        'The name of the icon. The icon set is strictly realted to @maggioli-design-system/icons',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    typography: {
      type: { name: 'string', required: false },
      description: 'Specifies the typography of the element',
      options: typographyInfoDictionary,
      control: { type: 'select' },
    },
    variant: {
      description: 'Specifies the variant for `typography`',
      options: typographyReadingVariationsDictionary,
      control: { type: 'select' },
    },
  },
};
const Template = (args) => (
  <mds-list>
    <mds-list-item {...args}>Pane</mds-list-item>
    <mds-list-item {...args}>Acqua</mds-list-item>
    <mds-list-item {...args}>Pasta</mds-list-item>
  </mds-list>
);

export const Default = {
  render: Template,
};

/**
 * Every state an item has of its own once the story has opened (#1440, @fixture/states), each in
 * a list of its own: the dot it starts from and an icon in its place, every typography with the
 * glyph lined up to its first line, the `read` variant, the long text that wraps under its own
 * indent, and the item of a list with `marker="none"`, which draws nothing around its content.
 * The marker and the layouts of a list are in the story of mds-list. No state needs an
 * interaction.
 */
interface ItemState {
  state: string;
  marker?: HTMLMdsListElement['marker'];
  item: Record<string, string>;
  text?: string;
}

const text = 'Documento di identita';
const long =
  'Relazione tecnica asseverata da un professionista abilitato, firmata digitalmente e allegata alla domanda';
const typographies = ['caption', 'detail', 'label', 'option', 'paragraph', 'tip'];

const itemStates: ItemState[] = [
  { state: 'dot (default)', item: {} },
  { state: 'icon', item: { icon: 'mi/baseline/check-circle' } },
  ...typographies.map((typography) => ({
    state: `typography ${typography}${typography === 'detail' ? ' (default)' : ''}, wrapped`,
    item: { typography },
    text: long,
  })),
  {
    state: 'variant read, wrapped',
    item: { typography: 'paragraph', variant: 'read' },
    text: long,
  },
  { state: 'icon, wrapped', item: { icon: 'mi/baseline/check-circle' }, text: long },
  { state: 'in a list with marker none', marker: 'none', item: {} },
];

const TemplateStates = () => (
  <StatesGrid>
    {itemStates.map(({ state, marker, item, text: itemText }) => (
      <StateCell key={state} state={state}>
        <mds-list marker={marker} aria-label="Documenti richiesti">
          <mds-list-item {...item}>{itemText ?? text}</mds-list-item>
          <mds-list-item {...item}>Codice fiscale</mds-list-item>
        </mds-list>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
