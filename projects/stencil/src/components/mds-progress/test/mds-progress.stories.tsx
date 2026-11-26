import { directionDictionary } from '../meta/dictionary';
import { themeVariantDictionary } from '@type/variant';
import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';
import { typographyTechnicalDictionary } from '@type/typography';
import { progressBarSizeDictionary } from '@type/progress';

export default {
  title: 'UI / Feedback / Progress',
  id: 'ui-progress',
  argTypes: {
    direction: {
      type: { name: 'string', required: false },
      control: { type: 'select' },
      description: 'Specifies the direction of the progress bar, if horizonatl or vertical',
      options: directionDictionary,
    },
    progress: {
      control: { type: 'range', step: 0.01, min: 0, max: 1 },
      type: { name: 'number', required: false },
      description: 'A value between 0 and 1 that rapresents the status progress',
    },
    size: {
      type: { name: 'string', required: false },
      description: 'Sets the size of the component',
      options: progressBarSizeDictionary,
      control: { type: 'select' },
    },
    typography: {
      type: { name: 'string', required: false },
      description: 'Specifies the typography of the progress bar',
      options: typographyTechnicalDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string', required: false },
      description: 'Sets the theme variant colors',
      options: themeVariantDictionary,
      control: { type: 'select' },
    },
  },
};

const Template = (args) => <mds-progress aria-label="Progress bar title" {...args} />;

export const Default = {
  render: Template,

  args: {
    progress: 0.35,
  },
};

export const Vertical = {
  render: Template,

  args: {
    progress: 0.35,
    direction: 'vertical',
    style: {
      height: '200px',
    },
  },
};

export const Radial = {
  render: Template,

  args: {
    progress: 0.35,
    direction: 'radial',
    style: {
      width: '64px',
    },
  },
};

/**
 * Every state of the progress once the story has opened (#1440, @fixture/states), each bar named
 * by `aria-label` as a product names it. The values are fixed: a bar is drawn at its value from
 * the first render, and only a later change of `progress` moves it (750ms, none with a reduced
 * animation), so the story sets no timer and has no play function. A value outside 0..1 is drawn
 * at its nearest end. The vertical bar takes its height from the cell (`h-5000`), the radial one
 * its width (`w-1600`), as the usage docs say; the states the ring has of its own (sizes, icon)
 * are in the story of mds-radial-progress. `steps` changes only the spoken value
 * (`aria-valuetext`), nothing on screen. A bar with `aria-hidden` is no progressbar for assistive
 * technologies, and looks the same.
 */
interface ProgressState {
  state: string;
  props: Record<string, string | number>;
}

const progressStates: ProgressState[] = [
  { state: 'start, progress 0', props: { progress: 0 } },
  { state: 'progress 0.35', props: { progress: 0.35 } },
  { state: 'complete, progress 1', props: { progress: 1 } },
  { state: 'over the end, progress 1.4', props: { progress: 1.4 } },
  { state: 'under the start, progress -0.2', props: { progress: -0.2 } },
  ...themeVariantDictionary.map((variant) => ({
    state: variant === 'primary' ? 'variant primary (default)' : `variant ${variant}`,
    props: { progress: 0.6, variant },
  })),
  ...progressBarSizeDictionary.map((size) => ({
    state: size === 'sm' ? 'size sm (default)' : `size ${size}`,
    props: { progress: 0.6, size },
  })),
  { state: 'vertical', props: { progress: 0.35, direction: 'vertical', class: 'h-5000' } },
  {
    state: 'vertical, size xl, variant success',
    props: {
      progress: 0.8,
      direction: 'vertical',
      size: 'xl',
      variant: 'success',
      class: 'h-5000',
    },
  },
  { state: 'radial', props: { progress: 0.35, direction: 'radial', class: 'w-1600' } },
  {
    state: 'radial, typography label',
    props: { progress: 0.35, direction: 'radial', typography: 'label', class: 'w-1600' },
  },
  {
    state: 'radial, variant error',
    props: { progress: 0.85, direction: 'radial', variant: 'error', class: 'w-1600' },
  },
  {
    state: 'radial, complete',
    props: { progress: 1, direction: 'radial', variant: 'success', class: 'w-1600' },
  },
  {
    state: 'hidden from assistive technologies',
    props: { progress: 0.35, 'aria-hidden': 'true' },
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {progressStates.map(({ state, props }) => (
      <StateCell key={state} state={state}>
        <mds-progress aria-label="Caricamento del documento" {...props}></mds-progress>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
