import React, { Fragment, useEffect, useState } from 'react'
import faker from 'faker'

import Modal from '@UI/Modal/Modal'
import Button from '@UI/Button/Button'
import Paragraph from '@Typography/Paragraph/Paragraph'

faker.locale = 'it'

export default {
  title: 'UI/Modal',
  component: Modal,
}

export const basicUsage = () => {
  const [show, toggleModal] = useState(false)
  useEffect(() => {
    if (show) {
      toggleModal(false)
    }
  }, [show])
  const openModal = () => {
    toggleModal(true)
  }
  return (
    <Fragment>
      <Button onClick={() => openModal()} icon="statusInfo">
        Open modal
      </Button>
      <Modal show={show}>
        <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        <Paragraph>{faker.lorem.paragraph()}</Paragraph>
      </Modal>
    </Fragment>
  )
}

export const mobileMode = () =>
  <Modal show={true}>
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

export const fullConfigured = () =>
  <Modal title={faker.lorem.sentence()} onConfirm={() => {}} show={true}>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
    <Paragraph>{faker.lorem.paragraph()}</Paragraph>
  </Modal>
