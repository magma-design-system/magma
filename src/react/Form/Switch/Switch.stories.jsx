import React from 'react'
import { storiesOf } from '@storybook/react'
import Page from '../../Page/Page'

import Switch from './Switch'

storiesOf('Form/Switch', module)
  .addDecorator(story => <Page>{story()}</Page>)
  .add('Default', () =>
    <Switch>Label name of the switch</Switch>
  )
  .add('Active by default', () =>
    <Switch isChecked={true}>I'm am checked by default</Switch>
  )
  .add('Custom color', () =>
    <Switch boxClassName="background-color-red-2">
      Custom color <code>background-color-red-2</code>
    </Switch>
  )
