import React, { Fragment, useState } from 'react'
import { storiesOf } from '@storybook/react'
import Page from '../Page/Page'

import Modal from './Modal'
import Button from '../Form/Button/Button'

const description = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'

const ContextSlider = props => {
  const [show, toggleModal] = useState(false)
  return (
    <Fragment>
      <Button onClick={() => { toggleModal(true) }} icon="test">
        Open modal
      </Button>
      <Modal show={show} onClose={() => { console.log('close??'); toggleModal(false) }}>
        {description}<br/><br/>{description}<br/><br/>{description}
      </Modal>
    </Fragment>
  )
}

const ContextSliderDesktop = props => {
  const [show, toggleModal] = useState(true)
  return (
    <Fragment>
      <Button onClick={() => { toggleModal(true) }} icon="test">
        Open modal
      </Button>
      <Modal desktopMode={true} show={show} onClose={() => { toggleModal(false) }}>
        {description}<br/><br/>{description}<br/><br/>{description}
      </Modal>
    </Fragment>
  )
}

const ContextSliderFull = props => {
  const [show, toggleModal] = useState(true)
  return (
    <Fragment>
      <Button onClick={() => { toggleModal(true) }} icon="test">
        Open modal
      </Button>
      <Modal title="Are you sure?" desktopMode={true} show={show} onConfirm={() => { toggleModal(false) }} onClose={() => { toggleModal(false) }}>
        {description}<br/><br/>{description}<br/><br/>{description}
      </Modal>
    </Fragment>
  )
}

storiesOf('Modal', module)
  .addDecorator(story => <Page>{story()}</Page>)
  .add('Default', () =>
    <Modal show={true}>
      {description}<br/><br/>{description}<br/><br/>{description}
    </Modal>,
  )
  .add('Left position', () =>
    <Modal position="left">
      {description}<br/><br/>{description}<br/><br/>{description}
    </Modal>,
  )
  .add('Clean', () =>
    <Modal show={true} contentOnly={true}>
      {description}<br/><br/>{description}<br/><br/>{description}
    </Modal>,
  )
  .add('Title', () =>
    <Modal show={true} title="Confirm this stuff or go away">
      {description}<br/><br/>{description}<br/><br/>{description}
    </Modal>,
  )
  .add('Title and clean', () =>
    <Modal show={true} contentOnly={true} title="Confirm this stuff or go away">
      {description}<br/><br/>{description}<br/><br/>{description}
    </Modal>,
  )
  .add('Footer', () =>
    <Modal show={true} onConfirm={() => {}}>
      {description}<br/><br/>{description}<br/><br/>{description}
    </Modal>,
  )
  .add('Desktop mode', () =>
    <ContextSliderDesktop/>,
  )
  .add('Full configured', () =>
    <ContextSliderFull/>,
  )
  .add('Open / close', () =>
    <ContextSlider/>,
  )
