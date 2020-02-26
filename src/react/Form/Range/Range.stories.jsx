import React from 'react'
import { storiesOf } from '@storybook/react'
import Page from '../../Page/Page'

import Range from './Range'

storiesOf('Form/Range', module)
  .addDecorator(story => <Page>{story()}</Page>)
  .add('Default', () =>
    <Range/>
  )
