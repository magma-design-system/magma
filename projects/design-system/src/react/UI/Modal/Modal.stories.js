import React from 'react'
import faker from 'faker'

import Modal from '@UI/Modal/Modal'
import Button from '@UI/Button/Button'
import Image from '@Content/Image/Image'
import Grid from '@Layout/Grid/Grid'
import Paragraph from '@Typography/Paragraph/Paragraph'
import Toggler from '@Behavior/Toggler/Toggler'

faker.locale = 'it'

export default {
  title: 'UI/Modal',
  component: Modal,
}

export const basicUsage = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri modale
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <Modal onConfirm={() => console.log('onConfirm')} onCancel={() => console.log('onCancel')}>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </Modal>
      </Toggler.Content>
    </Toggler>
  )
}

export const fromLeft = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri modale
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <Modal position="left" onConfirm={() => console.log('onConfirm')} onCancel={() => console.log('onCancel')}>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </Modal>
      </Toggler.Content>
    </Toggler>
  )
}

export const fromCenter = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri modale
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <Modal position="center">
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </Modal>
      </Toggler.Content>
    </Toggler>
  )
}

export const desktopModeSimple = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri modale
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <Modal position="center" footer={false}>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </Modal>
      </Toggler.Content>
    </Toggler>
  )
}

export const headerTitle = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri modale
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <Modal title={faker.lorem.sentence()} position="center" onConfirm={() => console.log('onConfirm')} onCancel={() => console.log('onCancel')}>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </Modal>
      </Toggler.Content>
    </Toggler>
  )
}

export const maxHeight = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri modale
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <Modal maxHeight={true} title={faker.lorem.sentence()} position="center" onConfirm={() => console.log('onConfirm')} onCancel={() => console.log('onCancel')}>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </Modal>
      </Toggler.Content>
    </Toggler>
  )
}

export const simple = () =>
  <Toggler>
    <Toggler.Trigger>
      <Button icon="status-info">
        Apri modale
      </Button>
    </Toggler.Trigger>
    <Toggler.Content>
      <Modal footer={false} maxHeight={true} title={faker.lorem.sentence()} position="center" onConfirm={() => console.log('onConfirm')} onCancel={() => console.log('onCancel')}>
        <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        <Paragraph>{faker.lorem.paragraph()}</Paragraph>
      </Modal>
    </Toggler.Content>
  </Toggler>

export const contentOnly = () =>
  <Toggler>
    <Toggler.Trigger>
      <Button icon="status-info">
        Apri modale
      </Button>
    </Toggler.Trigger>
    <Toggler.Content>
      <Modal contentOnly footer={false} maxHeight={true} title={faker.lorem.sentence()} position="center" onConfirm={() => console.log('onConfirm')} onCancel={() => console.log('onCancel')}>
        <Image src="//via.placeholder.com/350x150" />
        <Grid className="padding-normal">
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </Grid>
      </Modal>
    </Toggler.Content>
  </Toggler>

export const customButtons = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri modale
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <Modal position="center" confirmButton='Salva' cancelButton='Torna indietro'>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </Modal>
      </Toggler.Content>
    </Toggler>
  )
}
