import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';
import { toastPositionDictionary } from '@component/mds-toast/meta/dictionary';

export default {
  title: 'UI / Feedback / Toast Region',
  id: 'ui-toast-toast-region',
  argTypes: {
    max: {
      description:
        'The most toasts visible at once: when one more shows, the oldest one with a `duration` is hidden',
      type: { name: 'number', required: false },
    },
    position: {
      description: 'Sets the edge of the viewport where the toasts line up',
      type: { name: 'string', required: false },
      options: toastPositionDictionary,
      control: { type: 'select' },
    },
  },
  args: {
    max: 3,
    position: 'bottom-center',
  },
};

const messages = [
  'Documento salvato',
  'Link copiato negli appunti',
  'Contatto eliminato',
  'Impostazioni aggiornate',
];
let shown = 0;

// a new toast in the region of the story, removed from the page once it has closed
const showToast = (event: MouseEvent): void => {
  const story = (event.currentTarget as HTMLElement).closest('.toast-region-story');
  const region = story?.querySelector('mds-toast-region');
  if (!region) return;
  const toast = document.createElement('mds-toast');
  toast.variant = 'success';
  toast.textContent = messages[shown % messages.length];
  shown += 1;
  toast.addEventListener('mdsToastClose', () => toast.remove());
  region.append(toast);
  toast.visible = true;
};

const Template = (args) => (
  <div class="toast-region-story">
    <mds-button onClick={showToast}>Mostra una conferma</mds-button>
    <mds-toast-region {...args}>
      <mds-toast visible dismissible duration={0} variant="error">
        <mds-icon slot="icon" name="mi/baseline/warning" />
        Invio non riuscito
        <mds-button slot="action" size="sm" variant="error" tone="weak">
          Riprova
        </mds-button>
      </mds-toast>
      <mds-toast visible duration={0}>
        Bozza salvata
      </mds-toast>
    </mds-toast-region>
  </div>
);

export const Default = {
  render: Template,
};

export const Top = {
  args: {
    position: 'top-right',
  },
  render: Template,
};

/**
 * Every state of the region once the story has opened (#1440, @fixture/states). The region is
 * fixed to an edge of the viewport: each cell holds it on a stage of its own, a box with a
 * `transform`, which makes it the containing block of the fixed region, and `overflow-hidden`;
 * so the regions of the page do not pile up at the edges of the window. The toasts stay
 * (`duration="0"`), or a countdown would hide them while the story is open; the states the toast
 * has of its own (variants, parts, a toast fixed on its own) are in the story of mds-toast. A
 * toast written with a `position` of its own takes the one of the region. The one state that
 * comes from a later change is the cap: in a region with `max="2"`, the play function shows a
 * third toast, as a product does, and checks that the region hid the oldest one with a
 * `duration` (one minute, so it does not leave by itself first). The toast is shown by its
 * attribute: the region follows the `visible` attribute, which Stencil reflects from the property
 * only on the next frame.
 */
interface RegionToast {
  text: string;
  hidden?: boolean;
  props?: Record<string, string | number>;
}

interface RegionState {
  state: string;
  play?: boolean;
  tall?: boolean;
  props: Record<string, string | number>;
  toasts: RegionToast[];
}

const saved = { text: 'Documento salvato', props: { variant: 'success' } };
const copied = { text: 'Link copiato negli appunti' };
const deleted = { text: 'Contatto eliminato' };

const regionStates: RegionState[] = [
  { state: 'one toast', props: {}, toasts: [saved] },
  {
    state: 'several toasts, newest at the edge',
    tall: true,
    props: {},
    toasts: [saved, copied, deleted],
  },
  ...toastPositionDictionary.map((position) => ({
    state:
      position === 'bottom-center' ? 'position bottom-center (default)' : `position ${position}`,
    props: { position },
    toasts: [saved, copied],
  })),
  {
    state: 'a hidden toast takes no room',
    props: {},
    toasts: [saved, { ...copied, hidden: true }, deleted],
  },
  {
    state: 'a toast with a position of its own',
    props: { position: 'top-right' },
    toasts: [{ ...saved, props: { ...saved.props, position: 'bottom-left' } }],
  },
  {
    state: 'over max, toasts that stay',
    tall: true,
    props: { max: 2 },
    toasts: [saved, copied, deleted],
  },
  {
    state: 'max reached, oldest hidden',
    play: true,
    props: { max: 2 },
    toasts: [
      { ...saved, props: { ...saved.props, duration: 60000 } },
      copied,
      { ...deleted, hidden: true },
    ],
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {regionStates.map(({ state, play, tall, props, toasts }) => (
      <StateCell key={state} state={state} play={play}>
        <div
          class={`relative overflow-hidden rounded-md bg-surface-default ${tall ? 'h-6400' : 'h-4800'}`}
          style={{ transform: 'translateZ(0)' }}
        >
          <mds-toast-region {...props}>
            {toasts.map((toast) => (
              <mds-toast
                key={toast.text}
                visible={toast.hidden ? undefined : true}
                duration={0}
                {...toast.props}
              >
                {toast.text}
              </mds-toast>
            ))}
          </mds-toast-region>
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const cell = stateCell(canvasElement, 'max reached, oldest hidden');
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  const [oldest, staying, newest] = Array.from(
    cell.querySelectorAll('mds-toast'),
  ) as HTMLMdsToastElement[];
  newest.setAttribute('visible', '');

  await waitFor(() => expect(newest).toHaveProperty('visible', true));
  await waitFor(() => expect(oldest).toHaveProperty('visible', false));
  await expect(staying).toHaveProperty('visible', true);
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
