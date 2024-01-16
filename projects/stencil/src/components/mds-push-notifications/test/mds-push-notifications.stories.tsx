import { h } from '@stencil/core'
import { Fragment, useState } from 'react'

export default {
  title: 'UI / Push Notifications',
  argTypes: {
    visible: {
      type: { name: 'boolean' },
      description: 'Specifies the subject of the component',
    },
  },
}

const PushNotificationsElements = () =>
  <Fragment>
    <mds-push-notification preview="avatar" src="./avatar-05-200x200.jpeg" subject="Sarah Ho" message="Sto preparando il documento che mi hai richiesto, dovrei finire in giornata, fammi sapere se hai altri aggiornamenti al riguardo così non mi perdo pezzi per la strada.">
      <mds-button slot="actions" variant="primary" tone="weak" size="sm">Rispondi</mds-button>
    </mds-push-notification>
    <mds-push-notification preview="avatar" src="./avatar-02-200x200.png" subject="Marco Cicognetti" message="Ci sei andato poi alla riunione?">
      <mds-button slot="actions" variant="primary" tone="weak" size="sm">Rispondi</mds-button>
    </mds-push-notification>
    <mds-push-notification preview="avatar" src="./avatar-06-200x200.jpeg" subject="James Millennial" message="Domani ci sei alla riunione che ha organizzato Gigetto? Ho saputo che ci sarà anche Puppo.">
      <mds-button slot="actions" variant="primary" tone="weak" size="sm">Rispondi</mds-button>
    </mds-push-notification>
  </Fragment>

const PushNotificationElement = ({ key, index }) => {
  return <mds-push-notification key={key} icon="mi/baseline/attachment" subject={`Notification ${index + 1}`} message="Sto preparando il documento che mi hai richiesto, dovrei finire in giornata, fammi sapere se hai altri aggiornamenti al riguardo così non mi perdo pezzi per la strada."></mds-push-notification>
}

const Template = args => {
  const [visible, setVisibility] = useState(false)
  window.addEventListener('mdsModalClose', () => { setVisibility(false) })
  return <div>
    <mds-button onClick={() => setVisibility(!visible) }>Show / Hide notifications</mds-button>
    <mds-push-notifications visible={visible} onMdsPushNotificationHide={() => setVisibility(!visible)} {...args}>
      <mds-button slot="top" variant="dark">Cancella notifiche</mds-button>
      <PushNotificationsElements/>
      <mds-button slot="bottom" variant="dark">Carica altre...</mds-button>
    </mds-push-notifications>
  </div>
}

const TemplateAddNotifications = args => {
  const [items, setItem] = useState(0)
  return <div>
    <mds-button onClick={() => setItem(items + 1) }>Add notifications</mds-button>
    <mds-push-notifications {...args}>
      <mds-button slot="top" variant="dark">Cancella notifiche</mds-button>
      { Array.from(Array(items).keys()).map((_item, index) =>
        <PushNotificationElement key={index} index={index}/>,
      ) }
      <mds-button slot="bottom" variant="dark">Carica altre...</mds-button>
    </mds-push-notifications>
  </div>
}

const TemplateAddMultipleNotifications = args => {
  const [items, setItem] = useState(0)
  return <div>
    <mds-button onClick={() => setItem(items + 3) }>Add notifications</mds-button>
    <mds-push-notifications {...args}>
      <mds-button slot="top" variant="dark">Cancella notifiche</mds-button>
      { Array.from(Array(items).keys()).map((_item, index) =>
        <PushNotificationElement key={index} index={index}/>,
      ) }
      <mds-button slot="bottom" variant="dark">Carica altre...</mds-button>
    </mds-push-notifications>
  </div>
}

export const Default = Template.bind({})
export const AddNotifications = TemplateAddNotifications.bind({})
AddNotifications.args = {
  visible: true,
}
export const AddMultipleNotifications = TemplateAddMultipleNotifications.bind({})
AddMultipleNotifications.args = {
  visible: true,
}
