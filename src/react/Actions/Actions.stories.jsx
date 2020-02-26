import React, { Fragment, useState } from 'react'
import { storiesOf } from '@storybook/react'
// import { action } from '@storybook/addon-actions'
import Page from '../Page/Page'

import Actions from './Actions'
import Switch from '../Form/Switch/Switch'
import Button from '../Form/Button/Button'

const Wrapper = props => {
  const [show, toggleShow] = useState(false)
  return (
    <Fragment>
      <Switch isChecked={show} onChange={() => toggleShow(!show)}>
        Activate actions
      </Switch>
      <Actions show={show}>
        <Button icon="recipe" action="option">Cambia ricetta</Button>
        <Button icon="reboot" action="option">Riavvia</Button>
        <Button icon="assignTo" action="option">Assegna a</Button>
        <Button icon="tag" action="option">Tag</Button>
      </Actions>
    </Fragment>
  )
}

storiesOf('Actions', module)
  .addDecorator(story => <Page>{story()}</Page>)
  .add('Default', () =>
    <Wrapper/>,
  )
