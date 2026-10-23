import { h } from '@stencil/core';
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
      <mds-toast visible deletable duration={0} variant="error">
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
