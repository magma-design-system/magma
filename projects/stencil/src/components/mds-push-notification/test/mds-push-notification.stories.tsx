import { h } from '@stencil/core';
import { expect, waitFor } from 'storybook/test';
import { StateCell, StatesGrid, stateCell } from '@fixture/states';
import { Fragment, useState, useEffect } from 'react';
import { NotificationItemPreviewType } from 'src/components';

export default {
  title: 'UI / Feedback / Push Notification',
  id: 'ui-push-notification',
  argTypes: {
    visible: {
      type: { name: 'boolean' },
      description: 'Specifies the subject of the component',
    },
  },
};
interface Notification {
  message: string;

  datetime?: string;
  preview?: NotificationItemPreviewType;
  icon?: string;
  initial?: string;
  src?: string;
  subject?: string;
}
const exampleNotifications: Notification[] = [
  {
    preview: 'avatar',
    src: './avatar-05-200x200.jpeg',
    subject: 'Sarah Ho',
    message:
      'Sto preparando il documento che mi hai richiesto, dovrei finire in giornata, fammi sapere se hai altri aggiornamenti al riguardo così non mi perdo pezzi per la strada.',
  },
  {
    preview: 'avatar',
    src: './avatar-02-200x200.png',
    subject: 'Marco Cicognetti',
    message: 'Ci sei andato poi alla riunione?',
  },
  {
    preview: 'avatar',
    src: './avatar-06-200x200.jpeg',
    subject: 'JamPushNotificationElementes Millennial',
    message:
      'Domani ci sei alla riunione che ha organizzato Gigetto? Ho saputo che ci sarà anche Puppo.',
  },
];

const PushNotificationElement = ({ index }) => {
  return (
    <mds-push-notification-item
      icon="mi/baseline/attachment"
      subject={`Notification ${index + 1}`}
      message="Sto preparando il documento che mi hai richiesto, dovrei finire in giornata, fammi sapere se hai altri aggiornamenti al riguardo così non mi perdo pezzi per la strada."
    ></mds-push-notification-item>
  );
};

type GetNotificationsProps = {
  notifications: Notification[];
};
const GetNotifications = ({ notifications }: GetNotificationsProps) => {
  // console.log('getNotifications', notifications)
  if (notifications.length > 0) {
    return (
      <Fragment>
        {notifications.map((n, i) => {
          return (
            <mds-push-notification-item
              key={i}
              preview={n.preview}
              src={n.src}
              subject={n.subject}
              message={n.message}
            >
              <mds-button slot="actions" variant="primary" tone="weak" size="sm">
                Rispondi
              </mds-button>
            </mds-push-notification-item>
          );
        })}
      </Fragment>
    );
  }
};

const Template = (args) => {
  const [notifications, setNotifications] = useState<Notification[]>(exampleNotifications);
  const [visible, setVisible] = useState(args.visible || false);

  useEffect(() => {
    const pushNotificationsElement = document.querySelector('.mds-push-notification');
    if (pushNotificationsElement === null) {
      alert('Push notifications element not found');
      return;
    }
    pushNotificationsElement.addEventListener('mdsPushNotificationChange', (e: CustomEvent) => {
      console.info('mdsPushNotificationChange', e.detail);
      setVisible(e.detail);
    });

    pushNotificationsElement.addEventListener('mdsPushNotificationShow', () => {
      console.info('mdsPushNotificationShow');
      setVisible(true);
    });

    pushNotificationsElement.addEventListener('mdsPushNotificationHide', () => {
      console.info('mdsPushNotificationHide');
      setVisible(false);
    });
  }, []);

  function pushN() {
    const n: Notification = {
      message:
        'Sto preparando il documento che mi hai richiesto, dovrei finire in giornata, fammi sapere se hai altri aggiornamenti al riguardo così non mi perdo pezzi per la strada.',
    };
    setNotifications([...notifications, n]);
    // console.log(notifications)
  }
  return (
    <div class="-m-600">
      <div class="fixed top-600 left-600 flex gap-100">
        {visible ? (
          <mds-button
            class="shadow-ring-2 shadow-tone-neutral"
            onClick={() => setVisible(false)}
            icon="mdi/eye-off-outline"
            variant="error"
          >
            Hide notifications
          </mds-button>
        ) : (
          <mds-button
            class="shadow-ring-2 shadow-tone-neutral"
            onClick={() => setVisible(true)}
            icon="mi/baseline/remove-red-eye"
            variant="primary"
          >
            Show notifications
          </mds-button>
        )}
        <mds-button class="shadow-ring-2 shadow-tone-neutral" variant="success" onClick={pushN}>
          Carica altre...
        </mds-button>
      </div>
      <mds-push-notification
        class="mds-push-notification"
        visible={visible === false ? undefined : true}
        behavior={args.behavior}
      >
        {/* <mds-button slot="top" variant="dark" onClick={deleteNotifications}>Cancella notifiche</mds-button> */}
        <GetNotifications notifications={notifications} />
      </mds-push-notification>
      <div class="p-1200 flex justify-center">
        <div class="grid gap-600 grid-cols-3 max-mobile:grid-cols-1 max-w-screen-desktop">
          {Array(18)
            .fill(null)
            .map((_item, index) => {
              return (
                <div class="grid gap-25" key={index}>
                  <mds-text typography="h5" tag="h2">
                    This is a section title
                  </mds-text>
                  <mds-text>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus iure,
                    ratione beatae quam optio cumque rerum modi consectetur odit eligendi omnis
                    veniam fuga non ipsam voluptatum a ut neque illum.
                  </mds-text>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

const TemplateAddNotifications = () => {
  const [items, setItem] = useState(0);
  return (
    <div>
      <mds-button onClick={() => setItem(items + 1)}>Add notifications</mds-button>
      <mds-push-notification>
        {Array.from(Array(items).keys()).map((_item, index) => (
          <PushNotificationElement key={index} index={index} />
        ))}
      </mds-push-notification>
    </div>
  );
};

const TemplateAddMultipleNotifications = (args) => {
  const [items, setItem] = useState(0);
  const addItems = () => {
    setItem(items + 3);
  };
  return (
    <div>
      <mds-button onClick={addItems.bind(this)}>Carica notifiche...</mds-button>
      <mds-push-notification {...args}>
        <mds-button slot="top" variant="dark" onClick={addItems.bind(this)}>
          Carica notifiche...
        </mds-button>
        {Array.from(Array(items).keys()).map((_item, index) => (
          <PushNotificationElement key={index} index={index} />
        ))}
        <mds-button slot="bottom" variant="dark">
          Cancella notifiche
        </mds-button>
      </mds-push-notification>
    </div>
  );
};

export const Default = {
  render: Template,
};

export const AddNotifications = {
  render: TemplateAddNotifications,

  args: {
    visible: true,
  },
};

export const AddMultipleNotifications = {
  render: TemplateAddMultipleNotifications,

  args: {
    visible: true,
  },
};

export const ManualNotification = Template.bind({}, { behavior: 'manual' });

/**
 * Every state of the stack once the story has opened (#1440, @fixture/states). The stack is fixed
 * to the right edge of the viewport, from the top to the bottom: each cell holds it on a stage of
 * its own, a box with a `transform`, which makes it the containing block of the fixed stack, and
 * `overflow-hidden`, which clips the stack while it waits outside, hidden; the stage is the height
 * of the column the stack would fill. The notifications come in by themselves, a few hundred
 * milliseconds after the stack has loaded, and stay: none has a timer. The states the item has of
 * its own (preview, variants, slots, the long text) are in the story of mds-push-notification-item.
 * Two states only an interaction reaches: the stack cleared with its own button, and the stack
 * whose last notification the person dismissed; the play function clicks the button and checks
 * that the stack hid itself (`visible` back to no value), not its look.
 */
interface StackNotification {
  icon: string;
  subject: string;
  message: string;
  dismissible?: boolean;
}

interface StackState {
  state: string;
  play?: boolean;
  tall?: boolean;
  props: Record<string, string | boolean>;
  notifications: StackNotification[];
}

const protocol: StackNotification = {
  icon: 'mi/baseline/description',
  subject: 'Pratica protocollata',
  message: 'La pratica 2024/1042 ha ricevuto il numero di protocollo 18733.',
};
const attachment: StackNotification = {
  icon: 'mi/baseline/attach-file',
  subject: 'Nuovo allegato',
  message: 'Luca Bianchi ha caricato la planimetria aggiornata.',
};
const message: StackNotification = {
  icon: 'mi/baseline/email',
  subject: 'Nuovo messaggio',
  message: "Hai ricevuto una risposta dall'ufficio tecnico.",
};

const stackStates: StackState[] = [
  { state: 'one notification', props: {}, notifications: [protocol] },
  {
    state: 'several notifications',
    tall: true,
    props: {},
    notifications: [protocol, attachment, message],
  },
  { state: 'manual, hidden', props: { behavior: 'manual' }, notifications: [protocol] },
  {
    state: 'manual, shown by visible',
    props: { behavior: 'manual', visible: true },
    notifications: [protocol],
  },
  {
    state: 'shown, no notification',
    props: { behavior: 'manual', visible: true },
    notifications: [],
  },
  {
    state: 'cleared with its button',
    play: true,
    props: {},
    notifications: [protocol, attachment],
  },
  {
    state: 'last notification dismissed',
    play: true,
    props: {},
    notifications: [{ ...protocol, dismissible: true }],
  },
];

const TemplateStates = () => (
  <StatesGrid>
    {stackStates.map(({ state, play, tall, props, notifications }) => (
      <StateCell key={state} state={state} play={play}>
        <div
          class={`relative overflow-hidden rounded-md bg-surface-default ${tall ? 'h-9000' : 'h-6000'}`}
          style={{ transform: 'translateZ(0)' }}
        >
          <mds-push-notification {...props}>
            {notifications.map(({ icon, subject, message: text, dismissible }) => (
              <mds-push-notification-item
                key={subject}
                icon={icon}
                subject={subject}
                message={text}
                dismissible={dismissible}
              ></mds-push-notification-item>
            ))}
          </mds-push-notification>
        </div>
      </StateCell>
    ))}
  </StatesGrid>
);

/**
 * The stack of a cell, once every Magma element of the cell has loaded, the stack shows and its
 * notifications have come in, as a person sees them before clicking. The stack marks a
 * notification that came in with an inline `visibility: visible`, its own end of the entrance: a
 * click before it is a race of the component, where the notifications still coming in show the
 * stack again once the others leave.
 */
const shownStack = async (canvasElement: HTMLElement, state: string) => {
  const cell = stateCell(canvasElement, state);
  const elements = Array.from(cell.querySelectorAll('*')).filter((element) =>
    element.tagName.startsWith('MDS-'),
  );
  await waitFor(() => elements.forEach((element) => expect(element).toHaveAttribute('hydrated')));
  const stack = cell.querySelector('mds-push-notification') as HTMLMdsPushNotificationElement;
  await waitFor(() => expect(stack).toHaveProperty('visible', true));
  const items = Array.from(stack.querySelectorAll('mds-push-notification-item')) as HTMLElement[];
  await waitFor(() => items.forEach((item) => expect(item.style.visibility).toBe('visible')));
  return stack;
};

const playStates = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const cleared = await shownStack(canvasElement, 'cleared with its button');
  const clear = cleared.shadowRoot!.querySelector('mds-button') as HTMLMdsButtonElement;
  clear.click();

  const dismissed = await shownStack(canvasElement, 'last notification dismissed');
  const item = dismissed.querySelector('mds-push-notification-item') as HTMLElement;
  const close = item.shadowRoot!.querySelector('mds-button.close-button') as HTMLMdsButtonElement;
  await waitFor(() => expect(close).toHaveAttribute('hydrated'));
  close.click();

  // hidden is no value at all: the stack takes `visible` off
  await waitFor(() => expect(cleared).toHaveProperty('visible', undefined));
  await waitFor(() => expect(dismissed).toHaveProperty('visible', undefined));
};

export const States = {
  render: TemplateStates,

  play: playStates,
};
