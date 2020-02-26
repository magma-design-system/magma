import React from 'react'
import { storiesOf } from '@storybook/react'
import NavBar from './NavBar'
import Page from '../../Page/Page'

storiesOf('Navigation/NavBar', module)
  .addDecorator(story => <Page>{story()}</Page>)
  .add('Default', () =>
    <NavBar/>
  )
