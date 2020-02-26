import React from 'react'
import { storiesOf } from '@storybook/react'
import Page from '../../Page/Page'

import InputSerial from './InputSerial'

storiesOf('Form/Input/Serial', module)
  .addDecorator(story => <Page>{story()}</Page>)
  .add('Default', () =>
    <InputSerial />
  )
