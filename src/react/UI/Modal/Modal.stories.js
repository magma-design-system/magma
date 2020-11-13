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
        <Button icon="statusInfo">
          Open modal
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <Modal show={true}>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </Modal>
      </Toggler.Content>
    </Toggler>
  )
}

export const mobileMode = () =>
  <Modal show={true}>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
  </Modal>

export const mobileModeRight = () =>
  <Modal show={true} position="left">
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
  </Modal>

export const desktopMode = () =>
  <Modal desktopMode={true} show={true}>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
  </Modal>

export const headerTitle = () =>
  <Modal title={faker.lorem.sentence()} desktopMode={true} show={true}>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
  </Modal>

export const footerActions = () =>
  <Modal title={faker.lorem.sentence()} onConfirm={() => {}} desktopMode={true} show={true}>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
  </Modal>

export const maxHeight = () =>
  <Modal title={faker.lorem.sentence()} onConfirm={() => {}} maxHeight={true} desktopMode={true} show={true}>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
  </Modal>

export const fullConfigured = () =>
  <Modal title={faker.lorem.sentence()} onConfirm={() => {}} show={true}>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
  </Modal>
