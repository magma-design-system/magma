import React, { Fragment, useState } from 'react'
import faker from 'faker'

import Modal from '@Pattern/Modal/Modal'
import Button from '@Form/Button/Button'
import Paragraph from '@Typography/Paragraph/Paragraph'

faker.locale = 'it'

export default {
  title: 'Pattern/Modal',
  component: Modal,
}

export const basicUsage = () => {
  const [show, toggleModal] = useState(false)
  const toggle = () => {
    toggleModal(!show)
  }
  return (
    <Fragment>
      <Button onClick={() => { toggle() }} icon="statusInfo">
        Open modal
      </Button>
      <Modal show={show} onClose={() => { toggle() }}>
        <Paragraph></Paragraph>
        <Paragraph></Paragraph>
        <Paragraph></Paragraph>
      </Modal>
    </Fragment>
  )
}

export const mobileMode = () =>
  <Modal show={true}>
    <Paragraph></Paragraph>
    <Paragraph></Paragraph>
    <Paragraph></Paragraph>
  </Modal>

export const desktopMode = () =>
  <Modal desktopMode={true} show={true}>
    <Paragraph></Paragraph>
    <Paragraph></Paragraph>
    <Paragraph></Paragraph>
  </Modal>

export const headerTitle = () =>
  <Modal title={faker.lorem.sentence()} desktopMode={true} show={true}>
    <Paragraph></Paragraph>
    <Paragraph></Paragraph>
    <Paragraph></Paragraph>
  </Modal>

export const footerActions = () =>
  <Modal title={faker.lorem.sentence()} onConfirm={() => {}} desktopMode={true} show={true}>
    <Paragraph></Paragraph>
    <Paragraph></Paragraph>
    <Paragraph></Paragraph>
  </Modal>

export const fullConfigured = () =>
  <Modal title={faker.lorem.sentence()} onConfirm={() => {}} show={true}>
    <Paragraph></Paragraph>
    <Paragraph></Paragraph>
    <Paragraph></Paragraph>
  </Modal>
