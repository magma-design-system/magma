import { h } from '@stencil/core';
import { Fragment, useState, useEffect } from 'react';
import { NotificationItemPreviewType } from 'src/components';

export default {
  title: 'UI / Push Notification',
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
    src: '/avatar-05-200x200.jpeg',
    subject: 'Sarah Ho',
    message:
      'Sto preparando il documento che mi hai richiesto, dovrei finire in giornata, fammi sapere se hai altri aggiornamenti al riguardo così non mi perdo pezzi per la strada.',
  },
  {
    preview: 'avatar',
    src: '/avatar-02-200x200.jpeg',
    subject: 'Marco Cicognetti',
    message: 'Ci sei andato poi alla riunione?',
  },
  {
    preview: 'avatar',
    src: '/avatar-06-200x200.jpeg',
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
            class="shadow-outline-50 shadow-tone-neutral"
            onClick={() => setVisible(false)}
            icon="mdi/eye-off-outline"
            variant="error"
          >
            Hide notifications
          </mds-button>
        ) : (
          <mds-button
            class="shadow-outline-50 shadow-tone-neutral"
            onClick={() => setVisible(true)}
            icon="mi/baseline/remove-red-eye"
            variant="primary"
          >
            Show notifications
          </mds-button>
        )}
        <mds-button class="shadow-outline-50 shadow-tone-neutral" variant="success" onClick={pushN}>
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
          <PushNotificationElement index={index} />
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
          <PushNotificationElement index={index} />
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
