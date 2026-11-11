import { h } from '@stencil/core';
import { iconsDictionary } from '@type/icon';
import { themeVariantChipDictionary } from '@type/variant';
import { toneMinimalVariantDictionary } from '@type/tone';

import { useEffect } from 'react';

export default {
  title: 'UI / Tags / Chip',
  id: 'ui-chip',
  argTypes: {
    clickable: {
      type: { name: 'boolean' },
      description: 'Adds ARIA support to the element if has interaction',
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
