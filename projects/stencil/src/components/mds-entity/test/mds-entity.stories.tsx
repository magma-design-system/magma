import { h } from '@stencil/core';
import { useState } from 'react';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';
import { ButtonVariantType } from '@type/button';
import { iconsDictionary } from '@type/icon';
import { themeFullVariantAvatarDictionary } from '@type/variant';
import { toneMinimalVariantDictionary } from '@type/tone';

export default {
  title: 'UI / Data / Entity',
  id: 'ui-entity',
  argTypes: {
    await: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is awaiting a response from an external resource',
    },
    icon: {
      type: { name: 'string' },
      description: 'Specifies the icon to be displayed if src propery is not used',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    initials: {
      type: { name: 'string' },
      description:
        "The user's inizials displayed if there's no image available and icon is not set",
    },
    src: {
      type: { name: 'string' },
      description: 'The URL of the avatar image',
    },
    tone: {
      type: { name: 'string' },
      description: 'Specifies the tone variant of the component',
      options: toneMinimalVariantDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string' },
      description: 'Specifies the variant of the component',
      options: themeFullVariantAvatarDictionary,
      control: { type: 'select' },
    },
  },
};

const Template = (args) => (
  <mds-entity {...args} aria-label="Personaggio">
    <mds-text truncate="word" aria-label="Nome" role="text" typography="h6">
      Mario Rossi
    </mds-text>
    <mds-badge aria-label="Carattere" role="text" slot="detail" variant="orange" tone="weak">
      buono
    </mds-badge>
    <mds-text truncate="word" aria-label="Email" role="text" slot="detail" typography="caption">
      mario@nintendo.com
    </mds-text>
    <mds-button
      onClick={() => {
        console.info('Restore');
      }}
      slot="action"
      icon="mdi/replay"
      variant="primary"
      tone="strong"
      title="Restore"
    />
    <mds-button
      onClick={() => {
        console.info('Delete');
      }}
      slot="action"
      icon="mdi/delete"
      variant="error"
      tone="strong"
      title="Delete"
    />
  </mds-entity>
);

const TemplateLocation = (args) => (
  <mds-entity {...args} aria-label="Luogo">
    <mds-text truncate="word" typography="h6" title="Nome">
      Maggioli Headquarters
    </mds-text>
    <mds-text truncate="word" title="Strada" slot="detail" typography="caption">
      Via Pinelli 64, Santarcangelo di Romanga, Italy
    </mds-text>
    <mds-button
      slot="action"
      icon="mdi/map-marker"
      variant="primary"
      tone="strong"
      title="Go to Google Maps"
    />
  </mds-entity>
);

const TemplateDownload = (args) => {
  const [isUploading, setUpload] = useState(true);
  const [isComplete, setUploadComplete] = useState(false);
  let message = 'Upload in corso...';
  if (isUploading) {
    message = 'Upload in corso...';
  } else {
    message = 'Upload annullato';
  }
  if (isComplete) {
    message = 'Upload completato con successo';
  }
  return (
    <div class="grid gap-400 grid-cols-full">
      <mds-entity
        await={isUploading && !isComplete}
        icon={isComplete ? 'mi/baseline/done' : 'mi/baseline/remove-circle'}
        variant={isComplete ? 'success' : 'warning'}
        {...args}
        aria-label="File"
      >
        <mds-text truncate="word" aria-label="Nome" typography="h6">
          Report finanziario 2024.docx
        </mds-text>
        <mds-text truncate="word" aria-label="Stato caricamento" slot="detail" typography="caption">
          {message}
        </mds-text>
        {isUploading && !isComplete && (
          <mds-button
            onClick={() => setUpload(false)}
            slot="action"
            icon="mi/baseline/cancel"
            variant="light"
            title="Annulla upload"
          />
        )}
      </mds-entity>
      <div class="flex gap-400 flex-wrap justify-between">
        <mds-button
          onClick={() => {
            setUploadComplete(false);
            setUpload(true);
          }}
          variant="dark"
          tone="outline"
        >
          Riavvia
        </mds-button>
        <mds-button
          onClick={() => {
            setUploadComplete(true);
          }}
        >
          Completa upload
        </mds-button>
      </div>
    </div>
  );
};

const TemplateCustomIconColors = (args) => (
  <mds-entity
    {...args}
    style={{
      '--mds-entity-icon-background': 'transparent',
      '--mds-entity-icon-color': 'rgb(var(--magma-text-subtle))',
    }}
    aria-label="Luogo"
  >
    <mds-text truncate="word" typography="h6" title="Nome">
      Maggioli Headquarters
    </mds-text>
    <mds-text truncate="word" title="Strada" slot="detail" typography="caption">
      Via Pinelli 64, Santarcangelo di Romanga, Italy
    </mds-text>
    <mds-button
      slot="action"
      icon="mdi/map-marker"
      variant="primary"
      tone="strong"
      title="Go to Google Maps"
    />
  </mds-entity>
);

const TemplateInitials = (args) => (
  <mds-entity {...args} aria-label="Luogo">
    <mds-text truncate="word" typography="h6" title="Nome">
      Maggioli Headquarters
    </mds-text>
    <mds-text truncate="word" title="Strada" slot="detail" typography="caption">
      Via Pinelli 64, Santarcangelo di Romanga, Italy
    </mds-text>
    <mds-button
      slot="action"
      icon="mdi/map-marker"
      variant="primary"
      tone="strong"
      title="Go to Google Maps"
    />
  </mds-entity>
);

export const Default = {
  render: Template,

  args: {
    src: './avatar-mario-01.png',
  },
};

export const Initials = {
  render: TemplateInitials,

  args: {
    initials: 'mr',
  },
};

export const Icon = {
  render: TemplateLocation,

  args: {
    icon: 'mi/baseline/route',
  },
};

export const CustomIconColors = {
  render: TemplateCustomIconColors,

  args: {
    icon: 'mi/baseline/route',
  },
};

export const Uploading = {
  render: TemplateDownload,

  args: {
    tone: 'weak',
  },
};

/**
 * Every state of the entity once the story has opened (#1440, @fixture/states): the avatar from
 * each source (a photo, initials, an icon in the colours of the entity or of a variant in both
 * tones) and none, the spinner that takes its place while the entity waits (`await`), the name
 * alone, with details, with actions and with both, a badge among the details, the long name and
 * detail cut by their truncation. The colours of the avatar itself are in the story of
 * mds-avatar. The action added after load (`play: true`) is appended by the play function, which
 * checks that the entity opened its region of the actions: the entity has no property for it, so
 * the check reads the class of that region.
 */
interface EntityAction {
  icon: string;
  label: string;
  variant: ButtonVariantType;
}

interface EntityState {
  state: string;
  play?: boolean;
  entity: Record<string, string | boolean>;
  name: string;
  details?: string[];
  badge?: string;
  actions?: EntityAction[];
}

const mario = { src: './avatar-mario-01.png' };
const edit: EntityAction = { icon: 'mi/baseline/edit', label: 'Modifica', variant: 'dark' };
const remove: EntityAction = { icon: 'mi/baseline/delete', label: 'Elimina', variant: 'error' };
const actionAdded = 'an action added after load';

const entityStates: EntityState[] = [
  {
    state: 'photo, name, details and actions',
    entity: mario,
    name: 'Mario Rossi',
    details: ['mario.rossi@comune.it'],
    actions: [edit, remove],
  },
  {
    state: 'initials',
    entity: { initials: 'GB' },
    name: 'Giulia Bianchi',
    details: ['Ufficio tecnico'],
  },
  {
    state: 'icon, colours of the entity',
    entity: { icon: 'mi/baseline/account-balance' },
    name: 'Comune di Santarcangelo',
    details: ['Ente pubblico'],
  },
  {
    state: 'icon, variant success, tone strong',
    entity: { icon: 'mi/baseline/done', variant: 'success', tone: 'strong' },
    name: 'Relazione tecnica.pdf',
    details: ['Caricato'],
  },
  {
    state: 'icon, variant warning, tone weak',
    entity: { icon: 'mi/baseline/warning', variant: 'warning', tone: 'weak' },
    name: 'Planimetria.dwg',
    details: ['Formato da verificare'],
  },
  {
    state: 'icon, variant error, tone weak',
    entity: { icon: 'mi/baseline/cancel', variant: 'error', tone: 'weak' },
    name: 'Visura catastale.pdf',
    details: ['Caricamento non riuscito'],
  },
  { state: 'no avatar', entity: {}, name: 'Mario Rossi', details: ['mario.rossi@comune.it'] },
  {
    state: 'await, spinner in place of the avatar',
    entity: { icon: 'mi/baseline/description', await: true },
    name: 'Relazione tecnica.pdf',
    details: ['Caricamento in corso'],
    actions: [{ icon: 'mi/baseline/cancel', label: 'Annulla il caricamento', variant: 'dark' }],
  },
  { state: 'name only', entity: mario, name: 'Mario Rossi' },
  { state: 'name and actions', entity: mario, name: 'Mario Rossi', actions: [edit, remove] },
  {
    state: 'details with a badge',
    entity: mario,
    name: 'Mario Rossi',
    badge: 'Attivo',
    details: ['mario.rossi@comune.it'],
  },
  {
    state: 'long name and detail, truncated',
    entity: { initials: 'GB' },
    name: 'Giulia Bianchi Fontana, responsabile del procedimento',
    details: ['giulia.bianchifontana@ufficiotecnico.comune.santarcangelo.it'],
    actions: [edit],
  },
  {
    state: actionAdded,
    play: true,
    entity: mario,
    name: 'Mario Rossi',
    details: ['mario.rossi@comune.it'],
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {entityStates.map(({ state, play, entity, name, details, badge, actions }) => (
      <StateCell key={state} state={state} play={play}>
        <mds-entity {...entity}>
          <mds-text truncate="word" typography="h6">
            {name}
          </mds-text>
          {badge && (
            <mds-badge slot="detail" variant="success" tone="weak" label={badge}></mds-badge>
          )}
          {details?.map((detail) => (
            <mds-text key={detail} truncate="word" slot="detail" typography="caption">
              {detail}
            </mds-text>
          ))}
          {actions?.map(({ icon, label, variant }) => (
            <mds-button
              key={label}
              slot="action"
              icon={icon}
              aria-label={label}
              variant={variant}
              tone="text"
            ></mds-button>
          ))}
        </mds-entity>
      </StateCell>
    ))}
  </StatesGrid>
);

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const entity = stateCell(canvasElement, actionAdded).querySelector(
    'mds-entity',
  ) as HTMLMdsEntityElement;
  await waitFor(() => expect(entity).toHaveAttribute('hydrated'));
  const button = document.createElement('mds-button');
  button.setAttribute('slot', 'action');
  button.setAttribute('icon', 'mi/baseline/edit');
  button.setAttribute('aria-label', 'Modifica');
  button.setAttribute('variant', 'dark');
  button.setAttribute('tone', 'text');
  entity.append(button);
  // the entity has no property for its actions: the region it opens is the state
  await waitFor(() =>
    expect(entity.shadowRoot!.querySelector('.actions')).not.toHaveClass('actions--hidden'),
  );
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
