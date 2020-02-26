import React, { Fragment, useState } from 'react'
import { storiesOf } from '@storybook/react'
import Page from '../../Page/Page'

import Checkbox from './Checkbox'

const SyncCheckboxes = props => {
  const [isCheckboxActive, activateCheckbox] = useState(false)
  return (
    <Fragment>
      <Checkbox sync={true} isChecked={isCheckboxActive} onChange={isChecked => { activateCheckbox(isChecked) }}>First checkbox</Checkbox>
      <Checkbox sync={true} isChecked={isCheckboxActive} onChange={isChecked => { activateCheckbox(isChecked) }}>Second checkbox</Checkbox>
    </Fragment>
  )
}

storiesOf('Form/Checkbox', module)
  .addDecorator(story => <Page>{story()}</Page>)
  .add('Default', () =>
    <Checkbox>
      Unchecked checkbox
    </Checkbox>
  )
  .add('Active by default', () =>
    <Checkbox isChecked={true}>
      Already checked checkbox
    </Checkbox>
  )
  .add('Custom icon', () =>
    <Checkbox icon="machine">
      Custom checkbox
    </Checkbox>
  )
  .add('Custom color', () =>
    <Checkbox iconClassName="color-red-2">
      Custom color <code>color-red-2</code>
    </Checkbox>
  )
  .add('Sync', () =>
    <SyncCheckboxes/>
  )
