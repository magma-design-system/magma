import { h } from '@stencil/core';
import { iconsDictionary } from '@type/icon';
import { themeVariantChipDictionary } from '@type/variant';
import { toneMinimalVariantDictionary } from '@type/tone';

import { useEffect } from 'react';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';

export default {
  title: 'UI / Tags / Chip',
  id: 'ui-chip',
  argTypes: {
    clickable: {
      type: { name: 'boolean' },
      description:
        'Opens the content that revolves around what the chip names (an office, a person); not for an action, that is an mds-button',
    },
    deletable: {
      type: { name: 'boolean' },
      description: 'Shows the cross icon to perform cancel/delete action on element',
    },
    disabled: {
      type: { name: 'boolean' },
      description: 'Sets the component disabled status',
    },
    icon: {
      type: { name: 'string' },
      description: 'The name of the icon.',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    label: {
      type: { name: 'string' },
      description: "The label displayed to the right of the component's icon",
    },
    selected: {
      type: { name: 'boolean' },
      description: 'Sets the component selected',
    },
    selectable: {
      type: { name: 'boolean' },
      description: 'Sets if the component change is status to selected when is clicked',
    },
    swatch: {
      type: { name: 'string' },
      control: { type: 'color' },
      description:
        'A colour of the product drawn as a round swatch where the icon goes, in place of `icon`',
    },
    tone: {
      type: { name: 'string' },
      options: toneMinimalVariantDictionary,
      control: { type: 'select' },
      description: 'Sets the color variant tone of the component',
    },
    variant: {
      type: { name: 'string' },
      options: themeVariantChipDictionary,
      control: { type: 'select' },
      description: 'Sets the color variant of the component',
    },
  },
};

const Template = (args) => {
  useEffect(() => {
    const chipEl = document.querySelector('mds-chip') as HTMLMdsChipElement;
    chipEl.addEventListener('mdsChipClickLabel', (e: CustomEvent) => {
      console.info('mdsChipClickLabel', e.detail);
    });

    chipEl.addEventListener('mdsChipDelete', (e: CustomEvent) => {
      console.info('mdsChipDelete', e.detail);
    });

    chipEl.addEventListener('mdsChipSelect', (e: CustomEvent) => {
      console.info('mdsChipSelect', e.detail);
    });
  });
  return (
    <mds-chip
      {...args}
      onDelete={() => {
        console.info('onDelete');
      }}
    />
  );
};

export const Default = {
  render: Template,

  args: {
    label: 'Bovaro del Bernese',
  },
};

export const Selected = {
  render: Template,

  args: {
    label: 'Bovaro del Bernese',
    icon: 'mi/baseline/pets',
    selected: true,
  },
};

export const Icon = {
  render: Template,

  args: {
    label: 'Bovaro del Bernese',
    icon: 'mi/baseline/pets',
  },
};

/** Colours of the product, not roles: a swatch as light and as dark as the chip keeps its ring. */
const families = [
  { label: 'porcelain', swatch: '#f4f1ec', selected: true },
  { label: 'kaolin', swatch: '#9aa3ad' },
  { label: 'fireclay', swatch: '#a89586' },
  { label: 'ink', swatch: '#1b1d22' },
  { label: 'blue', swatch: '#2f6fd0', selected: true },
  { label: 'orange', swatch: 'oklch(70% 0.19 50)' },
];

const SwatchTemplate = () => (
  <div class="flex flex-wrap gap-200">
    {families.map(({ label, swatch, selected }) => (
      <mds-chip key={label} label={label} swatch={swatch} selectable selected={selected}></mds-chip>
    ))}
  </div>
);

export const Swatch = {
  render: SwatchTemplate,
};

export const Deletable = {
  render: Template,

  args: {
    deletable: true,
    label: 'Bovaro del Bernese',
  },
};

export const Clickable = {
  render: Template,

  args: {
    clickable: true,
    selectable: true,
    icon: 'mi/baseline/eco',
    label: 'Hover me to interact',
  },
};

export const FullyInteractive = {
  render: Template,

  args: {
    clickable: true,
    deletable: true,
    icon: 'mi/baseline/downhill-skiing',
    label: 'Downhill skiing',
  },
};

const variantToneCombinations = themeVariantChipDictionary.flatMap((variant) =>
  toneMinimalVariantDictionary.map((tone) => ({ tone, variant })),
);

const VariantsTableTemplate = () => (
  <mds-table>
    <mds-table-header>
      <mds-table-header-cell label="Preview"></mds-table-header-cell>
      <mds-table-header-cell label="Variant" sortable></mds-table-header-cell>
      <mds-table-header-cell label="Tone" sortable></mds-table-header-cell>
    </mds-table-header>
    <mds-table-body>
      {variantToneCombinations.map(({ tone, variant }) => (
        <mds-table-row key={`${variant}-${tone}`}>
          <mds-table-cell>
            <mds-chip
              variant={variant}
              tone={tone}
              icon="mi/baseline/pets"
              label="Hello world"
              deletable
            ></mds-chip>
          </mds-table-cell>
          <mds-table-cell value={variant}>
            <mds-text typography="hack" class="whitespace-nowrap">
              {variant}
            </mds-text>
          </mds-table-cell>
          <mds-table-cell value={tone}>
            <mds-text typography="hack" class="whitespace-nowrap">
              {tone}
            </mds-text>
          </mds-table-cell>
        </mds-table-row>
      ))}
    </mds-table-body>
  </mds-table>
);

export const VariantsTable = {
  render: VariantsTableTemplate,
};

/**
 * Every state of the chip once the story has opened (#1440, @fixture/states). A chip is a piece
 * of metadata of a record (a status, a category, an office, a colour), so every cell shows one as
 * a product does: static, removable from its record (`deletable`), the value of a filter
 * (`selectable`, and `selected`), or opening what it names (`clickable`); never an action, which
 * is an mds-button. Each variant is shown in both tones with the icon it paints, at rest and
 * selected, since the variant paints the icon and the border of a selected chip and nothing else.
 * The long label comes last: in a narrow column the chip keeps its whole line, wider than the
 * column, and last it covers no other cell. A state only an interaction reaches (`play: true`) is brought there by the play function, which
 * checks `selected` or the focus, not the look. The underline of a clickable label under the
 * pointer needs a real pointer, which a play does not move. A click on the delete button emits
 * `mdsChipDelete` and leaves the chip as it is: the product removes it, so it is no state of the
 * chip.
 */
interface ChipState {
  state: string;
  play?: boolean;
  /** the width the chips are given, for the long label */
  width?: string;
  chips: ({ label: string } & Record<string, string | boolean>)[];
}

// what each variant says in a product, with the icon that carries its colour
const chipVariants: [string, string, string][] = [
  ['primary', 'Ufficio Tributi', 'mi/baseline/account-balance'],
  ['secondary', 'Ufficio Tributi', 'mi/baseline/account-balance'],
  ['ai', 'Generato con IA', 'mi/baseline/auto-awesome'],
  ['dark', 'Archiviato', 'mi/baseline/folder-zip'],
  ['success', 'Approvato', 'mi/baseline/check-circle'],
  ['info', 'Da integrare', 'mi/baseline/info'],
  ['warning', 'In scadenza', 'mi/baseline/warning'],
  ['error', 'Respinto', 'mi/baseline/block'],
  ['amaranth', 'Cultura', 'mi/baseline/local-activity'],
  ['aqua', 'Clima', 'mi/baseline/ac-unit'],
  ['blue', 'Tecnologia', 'mi/baseline/terminal'],
  ['green', 'Ambiente', 'mi/baseline/eco'],
  ['lime', 'Agricoltura', 'mi/baseline/agriculture'],
  ['orange', 'Sport', 'mi/baseline/sports-soccer'],
  ['orchid', 'Famiglia', 'mi/baseline/family-restroom'],
  ['purple', 'Istruzione', 'mi/baseline/book'],
  ['red', 'Urbanistica', 'mi/baseline/location-city'],
  ['sky', 'Turismo', 'mi/baseline/explore'],
  ['violet', 'Design', 'mi/baseline/brush'],
  ['yellow', 'Parchi', 'mi/baseline/park'],
];

const office = { label: 'Ufficio Tributi', icon: 'mi/baseline/account-balance' };
const person = { label: 'Mario Rossi', icon: 'mi/baseline/person' };
const topic = { label: 'Ambiente', icon: 'mi/baseline/eco', variant: 'green', tone: 'weak' };
const filter = { ...topic, selectable: true };
const longLabel = 'Settore lavori pubblici, patrimonio e manutenzione del verde urbano';

const chipStates: ChipState[] = [
  { state: 'rest, label only', chips: [{ label: 'Ufficio Tributi' }] },
  { state: 'icon', chips: [office] },
  ...chipVariants.map(([variant, label, icon]) => ({
    state: `variant ${variant}${variant === 'primary' ? ' (default)' : ''} (strong, weak; selected)`,
    chips: [
      { label, icon, variant, tone: 'strong' },
      { label, icon, variant, tone: 'weak' },
      { label, icon, variant, tone: 'strong', selectable: true, selected: true },
      { label, icon, variant, tone: 'weak', selectable: true, selected: true },
    ],
  })),
  {
    state: 'swatch (a light, a mid and a dark colour)',
    chips: [
      { label: 'porcelain', swatch: '#f4f1ec' },
      { label: 'Calendario ferie', swatch: '#2f6fd0' },
      { label: 'ink', swatch: '#1b1d22' },
    ],
  },
  {
    state: 'swatch, selectable (at rest, selected)',
    chips: [
      { label: 'fireclay', swatch: '#a89586', selectable: true },
      { label: 'kaolin', swatch: '#9aa3ad', selectable: true, selected: true },
    ],
  },
  { state: 'swatch that is not a colour', chips: [{ label: 'Senza colore', swatch: 'nessuno' }] },
  { state: 'deletable', chips: [{ label: 'Ufficio Tributi', deletable: true }] },
  { state: 'deletable, icon', chips: [{ ...person, variant: 'primary', deletable: true }] },
  { state: 'clickable', chips: [{ ...office, tone: 'weak', clickable: true }] },
  {
    state: 'clickable and deletable',
    chips: [{ ...office, tone: 'weak', clickable: true, deletable: true }],
  },
  { state: 'selectable', chips: [filter] },
  { state: 'selectable, selected', chips: [{ ...filter, selected: true }] },
  {
    state: 'selectable and deletable, selected',
    chips: [{ ...filter, selected: true, deletable: true }],
  },
  { state: 'disabled', chips: [{ ...office, disabled: true }] },
  {
    state: 'disabled, clickable',
    chips: [{ ...office, tone: 'weak', clickable: true, disabled: true }],
  },
  { state: 'disabled, deletable', chips: [{ ...person, deletable: true, disabled: true }] },
  {
    state: 'disabled, selectable, selected',
    chips: [{ ...filter, selected: true, disabled: true }],
  },
  { state: 'selected by a click', play: true, chips: [filter] },
  { state: 'deselected by a click', play: true, chips: [{ ...filter, selected: true }] },
  { state: 'selected with Enter', play: true, chips: [filter] },
  { state: 'selected with Space', play: true, chips: [filter] },
  {
    state: 'clickable, focused',
    play: true,
    chips: [{ ...office, tone: 'weak', clickable: true }],
  },
  // last: the chip is wider than its column, and last it covers no other cell
  {
    state: 'long label, in a narrow column',
    width: 'max-w-4800',
    chips: [
      { label: longLabel },
      { label: longLabel, icon: 'mi/baseline/location-city', deletable: true },
    ],
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {chipStates.map(({ state, play, width, chips }) => (
      <StateCell key={state} state={state} play={play}>
        <div class={`flex flex-wrap items-center gap-200${width ? ` ${width}` : ''}`}>
          {chips.map(({ label, ...props }, index) => (
            <mds-chip key={String(index)} label={label} {...props}></mds-chip>
          ))}
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

/** The chip of a cell and its label, once every Magma element of the cell has loaded. */
const loadedChip = async (canvasElement: HTMLElement, state: string) => {
  const cell = stateCell(canvasElement, state);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  const chip = cell.querySelector('mds-chip') as HTMLMdsChipElement;
  // the label listens to the click and the keys, in the shadow root: a click on the host does
  // nothing
  const label = chip.shadowRoot!.querySelector('.label') as HTMLElement;
  return { chip, label };
};

/** A key sent to the label: Enter clicks on its press, Space on its release. */
const key = (label: HTMLElement, type: 'keydown' | 'keyup', code: string) =>
  label.dispatchEvent(
    new KeyboardEvent(type, {
      code,
      key: code === 'Space' ? ' ' : code,
      bubbles: true,
      cancelable: true,
    }),
  );

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const clicked = await loadedChip(canvasElement, 'selected by a click');
  clicked.label.click();
  const unclicked = await loadedChip(canvasElement, 'deselected by a click');
  unclicked.label.click();
  const enter = await loadedChip(canvasElement, 'selected with Enter');
  key(enter.label, 'keydown', 'Enter');
  const space = await loadedChip(canvasElement, 'selected with Space');
  key(space.label, 'keydown', 'Space');
  key(space.label, 'keyup', 'Space');
  const focused = await loadedChip(canvasElement, 'clickable, focused');
  focused.label.focus();

  // the property, not the attribute: Stencil reflects it on the next frame, and a hidden page
  // draws no frame
  await waitFor(() => expect(clicked.chip).toHaveProperty('selected', true));
  await waitFor(() => expect(unclicked.chip).not.toHaveProperty('selected', true));
  await waitFor(() => expect(enter.chip).toHaveProperty('selected', true));
  await waitFor(() => expect(space.chip).toHaveProperty('selected', true));
  await waitFor(() => expect(focused.chip.shadowRoot!.activeElement).toBe(focused.label));
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
