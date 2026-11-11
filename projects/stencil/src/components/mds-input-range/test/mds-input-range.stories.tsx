import { h } from '@stencil/core';
import { useEffect } from 'react';
import { expect, waitFor } from 'storybook/test';

export default {
  title: 'UI / Forms / Range',
  id: 'form-range',
  argTypes: {
    disabled: {
      type: { name: 'boolean' },
      description: 'Sets if the component is disabled',
    },
    min: {
      type: { name: 'number' },
      description: 'The lowest value in the range of permitted values',
    },
    max: {
      type: { name: 'number' },
      description: 'The greatest value in the range of permitted values',
    },
    step: {
      type: { name: 'number' },
      description:
        'The step attribute is a number that specifies the granularity that the value must adhere to, or the special value any, which is described below',
    },
    value: {
      type: { name: 'number' },
      description:
        'The value attribute contains a number which contains a representation of the selected number',
    },
  },
};

const Template = (args) => (
  <div class="grid gap-400">
    <mds-input-range {...args}>Range label</mds-input-range>
  </div>
);

const TemplateFormatLabel = (args) => {
  useEffect(() => {
    (document.querySelector('#custom-labeled') as HTMLMdsInputRangeElement).formatValue =
      formatValue;
  }, []);
  function formatValue(v: number) {
    return formatBytes(v);
  }

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'kB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    const value = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals));
    return `${value} ${sizes[i]}`;
  };

  return (
    <div>
      <mds-input-range id="custom-labeled" {...args} step="1048576" min="0" max="1073741824">
        File size
      </mds-input-range>
    </div>
  );
};

const hideHeaderCss = `
  mds-input-range::part(header) {
    display: none;
  }
`;

const HideHeaderTemplate = (args) => (
  <div>
    <style>{hideHeaderCss}</style>
    <mds-input-range {...args}>This shouldn't be visible</mds-input-range>
  </div>
);

export const Default = {
  render: Template,
};

export const Disabled = {
  render: Template,

  args: {
    disabled: true,
  },
};

export const Min = {
  render: Template,

  args: {
    min: -100,
  },
};

export const Max = {
  render: Template,

  args: {
    max: 200,
  },
};

export const Step = {
  render: Template,

  args: {
    step: 10,
  },
};

export const Value = {
  render: Template,

  args: {
    value: 90,
  },
};

export const FormatLabel = {
  render: TemplateFormatLabel,
};

export const HideHeader = {
  render: HideHeaderTemplate,
};

// Several values on one track, an mds-input-range-value each (#1261)

const thumbsOf = (range: HTMLElement): HTMLInputElement[] =>
  Array.from(range.shadowRoot?.querySelectorAll<HTMLInputElement>('input.field') ?? []);

/** The thumbs of a range once it has hydrated: until then its host is hidden, and so are their names. */
const hydratedThumbs = async (range: HTMLElement, count: number): Promise<HTMLInputElement[]> => {
  await waitFor(() => expect(range).toHaveAttribute('hydrated'));
  await waitFor(() => expect(thumbsOf(range)).toHaveLength(count));
  return thumbsOf(range);
};

const valuesOf = (range: HTMLElement): number[] =>
  Array.from(range.querySelectorAll('mds-input-range-value')).map((value) => Number(value.value));

/**
 * Renders the story in dark: the mode of Magma is the one of the page, so the story sets it on
 * <html> while it runs, and the cleanup gives back the mode the page had.
 */
const inDark = () => {
  const html = document.documentElement;
  const modes = Array.from(html.classList).filter((name) => name.startsWith('pref-mode-'));
  const property = html.style.getPropertyValue('--magma-pref-mode');
  const marked = html.hasAttribute('data-magma-pref');
  html.classList.remove(...modes);
  html.classList.add('pref-mode-dark');
  html.style.setProperty('--magma-pref-mode', 'dark');
  html.setAttribute('data-magma-pref', '');
  return () => {
    html.classList.remove('pref-mode-dark');
    html.classList.add(...modes);
    if (property) html.style.setProperty('--magma-pref-mode', property);
    else html.style.removeProperty('--magma-pref-mode');
    if (!marked) html.removeAttribute('data-magma-pref');
  };
};

/** The play of a story in dark, once the range has taken the mode of the page. */
const inDarkPlay = (play) => async (context) => {
  const range = context.canvasElement.querySelector('mds-input-range') as HTMLMdsInputRangeElement;
  await waitFor(() => expect(range).toHaveAttribute('pref-mode', 'dark'));
  await play(context);
};

const euro = (value: number): string =>
  value.toLocaleString('it-IT', { currency: 'EUR', maximumFractionDigits: 0, style: 'currency' });

const PriceTemplate = () => (
  <div class="grid gap-400">
    <mds-input-range
      min={0}
      max={500}
      step={10}
      name="price"
      ref={(element?: HTMLMdsInputRangeElement) => {
        if (element) element.formatValue = euro;
      }}
    >
      Price
      <mds-input-range-value value={100}>Minimum</mds-input-range-value>
      <mds-input-range-value value={400}>Maximum</mds-input-range-value>
    </mds-input-range>
  </div>
);

// each thumb has its own name and its own ring; the keys stop the minimum at the maximum
const playPrice = async ({ canvasElement, userEvent }) => {
  const range = canvasElement.querySelector('mds-input-range') as HTMLMdsInputRangeElement;
  const [minimum, maximum] = await hydratedThumbs(range, 2);
  await expect(minimum).toHaveAccessibleName('Minimum');
  await expect(maximum).toHaveAccessibleName('Maximum');

  minimum.focus();
  await userEvent.keyboard('{ArrowRight}');
  await expect(valuesOf(range)).toEqual([110, 400]);

  await userEvent.keyboard('{End}');
  await expect(valuesOf(range)).toEqual([400, 400]);

  await userEvent.keyboard('{Home}');
  maximum.focus();
  await userEvent.keyboard('{PageDown}');
  await expect(valuesOf(range)).toEqual([0, 350]);
  await waitFor(() =>
    expect(range.shadowRoot?.querySelector('.value')?.textContent).toContain(' \u2013 '),
  );
};

export const SeveralValuesPrice = {
  render: PriceTemplate,
  play: playPrice,
};

export const SeveralValuesPriceDark = {
  render: PriceTemplate,
  beforeEach: inDark,
  play: inDarkPlay(playPrice),
};

const ContrastTemplate = () => (
  <div class="grid gap-400">
    <mds-input-range
      min={1}
      max={21}
      step={0.5}
      name="contrast"
      ref={(element?: HTMLMdsInputRangeElement) => {
        if (element) element.formatValue = (value: number) => `${value}:1`;
      }}
    >
      Contrast scale
      <mds-input-range-value value={3}></mds-input-range-value>
      <mds-input-range-value value={4.5}></mds-input-range-value>
      <mds-input-range-value value={5}></mds-input-range-value>
      <mds-input-range-value value={7}></mds-input-range-value>
    </mds-input-range>
  </div>
);

// two stops a step apart lie on each other: the arrows move the one with the focus, which lies on
// top (the e2e test reads it under the pointer), up to its neighbour, never past it, and never
// move the neighbour
const playContrast = async ({ canvasElement, userEvent }) => {
  const range = canvasElement.querySelector('mds-input-range') as HTMLMdsInputRangeElement;
  const third = (await hydratedThumbs(range, 4))[2];

  third.focus();
  await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
  await expect(valuesOf(range)).toEqual([3, 4.5, 4.5, 7]);
  await expect(range.shadowRoot?.activeElement).toBe(third);

  await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
  await expect(valuesOf(range)).toEqual([3, 4.5, 6, 7]);
};

export const SeveralValuesContrastScale = {
  render: ContrastTemplate,
  play: playContrast,
};

export const SeveralValuesContrastScaleDark = {
  render: ContrastTemplate,
  beforeEach: inDark,
  play: inDarkPlay(playContrast),
};
