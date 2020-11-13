import React from 'react'
import faker from 'faker'

import Modal from '@UI/Modal/Modal'
import Button from '@UI/Button/Button'
import Paragraph from '@Typography/Paragraph/Paragraph'
import Toggler from '@Behavior/Toggler'

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

export const mobileModeLeft = () => {
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

export const desktopMode = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri modale
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <Modal desktopMode={true}>
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
        <Modal desktopMode={true} footer={false}>
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
        <Modal title={faker.lorem.sentence()} desktopMode={true} onConfirm={() => console.log('onConfirm')} onCancel={() => console.log('onCancel')}>
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
        <Modal maxHeight={true} title={faker.lorem.sentence()} desktopMode={true} onConfirm={() => console.log('onConfirm')} onCancel={() => console.log('onCancel')}>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </Modal>
      </Toggler.Content>
    </Toggler>
  )
}

export const simple = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri modale
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <Modal footer={false} maxHeight={true} title={faker.lorem.sentence()} desktopMode={true} onConfirm={() => console.log('onConfirm')} onCancel={() => console.log('onCancel')}>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </Modal>
      </Toggler.Content>
    </Toggler>
  )
}
