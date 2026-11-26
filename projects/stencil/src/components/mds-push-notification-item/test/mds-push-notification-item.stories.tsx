import { h } from '@stencil/core';
import { StateCell, StatesGrid } from '@fixture/states';
import { iconsDictionary } from '@type/icon';
import { themeFullVariantAvatarDictionary } from '@type/variant';
import { toneMinimalVariantDictionary } from '@type/tone';

import {
  notificationItemPreviewDictionary,
  notificationItemDateFormatDictionary,
} from '../meta/dictionary';

const timePadding = 45;
let itemsCreated = 10;

const getDatetime = (): string => {
  const datetime = new Date(new Date().getTime() - timePadding * itemsCreated * 1000);
  itemsCreated += 1;
  return datetime.toString();
};

export default {
  title: 'UI / Feedback / Push Notification / Push Notification Item',
  id: 'ui-push-notification-push-notification-item',
  argTypes: {
    datetime: {
      type: { name: 'string' },
      description:
        'Specifies the notification date based on [standard ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html).',
    },
    'date-format': {
      type: { name: 'string' },
      description:
        'Specifies if the notification date format shows time passed or displays date as a static string',
      options: notificationItemDateFormatDictionary,
      control: { type: 'select' },
    },
    dismissible: {
      type: { name: 'boolean' },
      description: 'Shows a dismiss button that emits `mdsPushNotificationItemClose`',
    },
    icon: {
      type: { name: 'string' },
      description: 'Specifies the icon to be displayed if src propery is not used',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    message: {
      type: { name: 'string' },
      description: 'Specifies the message of the component',
    },
    prevew: {
      type: { name: 'string' },
      description:
        'Specifies if the `src` attribute is used to show a the image as avatar or full image',
      options: notificationItemPreviewDictionary,
      control: { type: 'select' },
    },
    initials: {
      type: { name: 'string' },
      description:
        "The user's inizials displayed if there's no image available, initials will override tone and variant senttings to keep user recognizable from others",
    },
    src: {
      type: { name: 'string' },
      description: 'The URL of the image to be loaded',
    },
    subject: {
      type: { name: 'string' },
      description: 'Specifies the subject of the component',
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
  <div>
    <mds-push-notification-item {...args}></mds-push-notification-item>
  </div>
);

const TemplateWithAction = (args) => (
  <div>
    <mds-push-notification-item {...args}>
      <mds-button slot="action" variant={args.variant} tone="weak" size="sm">
        Show
      </mds-button>
    </mds-push-notification-item>
  </div>
);

const TemplateWithAttachment = (args) => (
  <div>
    <mds-push-notification-item {...args}>
      <mds-button slot="action" tone="outline" size="sm">
        Download
      </mds-button>
    </mds-push-notification-item>
  </div>
);

const TemplateWithAttachmentBadge = (args) => (
  <div>
    <mds-push-notification-item {...args}>
      <mds-badge slot="badge" variant="amaranth" tone="weak">
        pdf
      </mds-badge>
      <mds-button slot="action" tone="outline" size="sm">
        Download
      </mds-button>
    </mds-push-notification-item>
  </div>
);

const TemplateContact = (args) => (
  <div>
    <mds-push-notification-item {...args}>
      <mds-button slot="action" variant="success" tone="weak" size="sm">
        Write
      </mds-button>
      <mds-button slot="action" variant="error" tone="weak" size="sm">
        Ignore
      </mds-button>
    </mds-push-notification-item>
  </div>
);

export const Default = {
  render: Template,

  args: {
    datetime: getDatetime(),
    icon: 'mi/baseline/email',
    message: 'You have 3 new messages from different accounts',
    subject: 'New messages',
  },
};

export const Dismissible = {
  render: Template,

  args: {
    datetime: getDatetime(),
    icon: 'mi/baseline/email',
    message: 'You have 3 new messages from different accounts',
    subject: 'New messages',
    dismissible: true,
  },
};

export const Thumb = {
  render: Template,

  args: {
    datetime: getDatetime(),
    message: 'Image can be 48px max wide',
    src: './book-cover-01.webp',
    subject: 'Preview image',
  },
};

export const Variant = {
  render: TemplateWithAction,

  args: {
    datetime: getDatetime(),
    icon: 'mi/baseline/done',
    message: 'Description of the article changed successfully',
    subject: 'Article',
    variant: 'success',
  },
};

export const Attachment = {
  render: TemplateWithAttachment,

  args: {
    datetime: getDatetime(),
    icon: 'mi/baseline/attach-file',
    message: "You've got a new file attachment from Mark",
    subject: 'New attachment',
    variant: 'primary',
  },
};

export const AttachmentBadge = {
  render: TemplateWithAttachmentBadge,

  args: {
    datetime: getDatetime(),
    icon: 'mi/baseline/attach-file',
    message: "You've got a new file attachment from Mark",
    subject: 'New attachment',
    variant: 'primary',
  },
};

export const Contact = {
  render: TemplateContact,

  args: {
    datetime: getDatetime(),
    icon: 'mi/baseline/person',
    message: 'Ciao, sono Mario, questo è il mio contatto, buona giornata!',
    subject: 'Mario Giannini',
    tone: 'strong',
    variant: 'primary',
  },
};

export const ContactAvatar = {
  render: TemplateContact,

  args: {
    datetime: getDatetime(),
    message: 'Ciao, sono Sarah, questo è il mio contatto, buona giornata!',
    preview: 'avatar',
    src: './avatar-05-200x200.jpeg',
    subject: 'Sarah Ho',
    tone: 'strong',
    variant: 'primary',
  },
};

export const ContactAvatarInitials = {
  render: TemplateContact,

  args: {
    datetime: getDatetime(),
    initials: 'sh',
    message: 'Ciao, sono Sarah, questo è il mio contatto, buona giornata!',
    preview: 'avatar',
    subject: 'Sarah Ho',
    tone: 'strong',
    variant: 'primary',
  },
};

export const DateTime = {
  render: Template,

  args: {
    datetime: getDatetime(),
    message: 'Ciao, sono Sarah, questo è il mio contatto, buona giornata!',
    preview: 'avatar',
    src: './avatar-05-200x200.jpeg',
    subject: 'Sarah Ho',
    tone: 'strong',
    variant: 'primary',
  },
};

export const DateFormat = {
  render: Template,

  args: {
    'date-format': 'none',
    datetime: '2023-12-12',
    message: 'Ciao, sono Sarah, questo è il mio contatto, buona giornata!',
    preview: 'avatar',
    src: './avatar-05-200x200.jpeg',
    subject: 'Sarah Ho',
    tone: 'strong',
    variant: 'primary',
  },
};

/**
 * Every state a notification has of its own once the story has opened (#1440, @fixture/states),
 * each in a stack of its own: an item is a part of mds-push-notification, which brings it in and
 * takes it out. The stack is fixed to the right edge of the viewport, so each cell holds it on a
 * stage, a box with a `transform` (the containing block of the fixed stack) and
 * `overflow-hidden`; the stack, its clear button and its show and hide are in the story of
 * mds-push-notification, the item taken out by its dismiss button too. The variant and the tone
 * paint the chip of the icon, every one of them on the same icon. The date is a static one
 * (`date-format`, a date with no time zone, so it reads the same everywhere): the default
 * `timeago` writes the time passed since the date, which changes with the clock, and is left out.
 * The dismiss button shows only under the pointer or the focus, which a story does not hold, so
 * the cell `dismissible` shows the room it keeps on the right. No state needs an interaction.
 */
interface ItemState {
  state: string;
  tall?: boolean;
  badge?: boolean;
  actions?: string[];
  props: Record<string, string | boolean>;
}

const protocolItem = {
  icon: 'mi/baseline/description',
  subject: 'Pratica protocollata',
  message: 'La pratica 2024/1042 ha ricevuto il numero di protocollo 18733.',
};
const staticDate = { datetime: '2025-06-15T09:30:00', 'date-format': 'DD/MM/YYYY HH:mm' };

const itemStates: ItemState[] = [
  { state: 'icon, subject and message', props: protocolItem },
  { state: 'no subject', props: { icon: protocolItem.icon, message: protocolItem.message } },
  { state: 'no icon', props: { subject: protocolItem.subject, message: protocolItem.message } },
  { state: 'no message, the default text', props: { icon: protocolItem.icon } },
  {
    state: 'avatar, picture',
    props: {
      preview: 'avatar',
      src: './avatar-05-200x200.jpeg',
      subject: 'Sarah Ho',
      message: 'Ti ho inviato la bozza del parere, fammi sapere se va bene.',
    },
  },
  {
    state: 'avatar, initials',
    props: {
      preview: 'avatar',
      initials: 'SH',
      subject: 'Sarah Ho',
      message: 'Ti ho inviato la bozza del parere, fammi sapere se va bene.',
    },
  },
  {
    state: 'picture',
    props: {
      src: './book-cover-01.webp',
      subject: 'Nuovo volume disponibile',
      message: 'Il codice degli appalti commentato è nella tua biblioteca.',
    },
  },
  {
    state: 'icon and picture',
    props: {
      icon: 'mi/baseline/attach-file',
      src: './book-cover-01.webp',
      subject: 'Nuovo volume disponibile',
      message: 'Il codice degli appalti commentato è nella tua biblioteca.',
    },
  },
  { state: 'static date', props: { ...protocolItem, ...staticDate } },
  { state: 'badge', badge: true, props: { ...protocolItem, icon: 'mi/baseline/attach-file' } },
  { state: 'one action', tall: true, actions: ['Apri'], props: protocolItem },
  { state: 'two actions', tall: true, actions: ['Ignora', 'Apri'], props: protocolItem },
  { state: 'dismissible', props: { ...protocolItem, dismissible: true } },
  {
    state: 'long subject and message, clamped',
    props: {
      icon: protocolItem.icon,
      subject: 'Pratica 2024/1042 protocollata e assegnata al servizio Edilizia privata',
      message:
        'La pratica ha ricevuto il numero di protocollo 18733 ed è stata assegnata al servizio Edilizia privata, che la prenderà in carico entro dieci giorni lavorativi. Fino ad allora puoi modificare gli allegati.',
    },
  },
  {
    state: 'every part',
    tall: true,
    badge: true,
    actions: ['Ignora', 'Apri'],
    props: {
      ...protocolItem,
      ...staticDate,
      icon: 'mi/baseline/attach-file',
      variant: 'primary',
      dismissible: true,
    },
  },
  ...themeFullVariantAvatarDictionary.flatMap((variant) =>
    toneMinimalVariantDictionary.map((tone) => ({
      state: `variant ${variant}, ${tone}`,
      props: { ...protocolItem, variant, tone },
    })),
  ),
];

const TemplateStates = () => (
  <StatesGrid>
    {itemStates.map(({ state, tall, badge, actions, props }) => (
      <StateCell key={state} state={state}>
        <div
          class={`relative overflow-hidden rounded-md bg-surface-default ${tall ? 'h-5600' : 'h-4800'}`}
          style={{ transform: 'translateZ(0)' }}
        >
          <mds-push-notification>
            <mds-push-notification-item {...props}>
              {badge && <mds-badge slot="badge" variant="amaranth" label="pdf"></mds-badge>}
              {actions?.map((action, index) => (
                <mds-button
                  key={action}
                  slot="action"
                  size="sm"
                  tone={index < actions.length - 1 ? 'outline' : 'weak'}
                >
                  {action}
                </mds-button>
              ))}
            </mds-push-notification-item>
          </mds-push-notification>
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

export const States = {
  render: TemplateStates,
};
