import { h } from '@stencil/core'
import { Fragment, useState, useEffect } from 'react'

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

const PushNotificationElement = ( { index }) => {
  return <mds-push-notification icon="mi/baseline/attachment" subject={`Notification ${index + 1}`} message="Sto preparando il documento che mi hai richiesto, dovrei finire in giornata, fammi sapere se hai altri aggiornamenti al riguardo così non mi perdo pezzi per la strada."></mds-push-notification>
}

const Template = args => {
  const [visible, setVisibility] = useState(args.visible || false)

  useEffect(() => {
    const pushNotificationsElement = document.querySelector('.mds-push-notifications')
    if (pushNotificationsElement === null) {
      alert('Push notifications element not found')
      return
    }
    pushNotificationsElement.addEventListener('mdsPushNotificationsChange', (e: CustomEvent) => {
      console.info('mdsPushNotificationsChange', e.detail)
      // setVisibility(e.detail)
    })

    pushNotificationsElement.addEventListener('mdsPushNotificationsShow', () => {
      console.info('mdsPushNotificationsShow')
      setVisibility(true)
    })

    pushNotificationsElement.addEventListener('mdsPushNotificationsHide', () => {
      console.info('mdsPushNotificationsHide')
      setVisibility(false)
    })
  }, [])

  return <div class="-m-600">
    { visible
      ? <mds-button class="fixed top-600 left-600 shadow-outline-50 shadow-tone-neutral" onClick={() => setVisibility(false) } icon="mdi/eye-off-outline" variant="error">Hide notifications</mds-button>
      : <mds-button class="fixed top-600 left-600 shadow-outline-50 shadow-tone-neutral" onClick={() => setVisibility(true) } icon="mi/baseline/remove-red-eye" variant="primary">Show notifications</mds-button>
    }
    <mds-push-notifications class="mds-push-notifications" visible={visible === false ? undefined : true}>
      <mds-button slot="top" variant="dark">Cancella notifiche</mds-button>
      <PushNotificationsElements/>
      <mds-button slot="bottom" variant="dark">Carica altre...</mds-button>
    </mds-push-notifications>
    <div class="p-1200 flex justify-center">
      <div class="grid gap-600 grid-cols-3 mobile:grid-cols-1 max-w-screen-desktop">
        { Array(18).fill(null).map((_item, index) => {
          return (
            <div class="grid gap-25" key={index}>
              <mds-text typography='h5' tag="h2">This is a section title</mds-text>
              <mds-text>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus iure, ratione beatae quam optio cumque rerum modi consectetur odit eligendi omnis veniam fuga non ipsam voluptatum a ut neque illum.</mds-text>
            </div>
          )
        })}
      </div>
    </div>
  </div>
}

const TemplateAddNotifications = () => {
  const [items, setItem] = useState(0)
  return <div>
    <mds-button onClick={() => setItem(items + 1) }>Add notifications</mds-button>
    <mds-push-notifications>
      { Array.from(Array(items).keys()).map((_item, index) =>
        <PushNotificationElement index={index}/>,
      ) }
    </mds-push-notifications>
  </div>
}

const TemplateAddMultipleNotifications = args => {
  const [items, setItem] = useState(0)
  const addItems = () => {
    setItem(items + 3)
  }
  return <div>
    <mds-button onClick={addItems.bind(this)}>Carica notifiche...</mds-button>
    <mds-push-notifications {...args}>
      <mds-button slot="top" variant="dark" onClick={addItems.bind(this)}>Carica notifiche...</mds-button>
      { Array.from(Array(items).keys()).map((_item, index) =>
        <PushNotificationElement index={index}/>,
      ) }
      <mds-button slot="bottom" variant="dark">Cancella notifiche</mds-button>
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
