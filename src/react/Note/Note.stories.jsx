import React from 'react'
import { storiesOf } from '@storybook/react'
import Note from './Note'
import Page from '../Page/Page'

storiesOf('Note', module)
  .addDecorator(story => <Page>{story()}</Page>)
  .add('Default', () =>
    <Note>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec quis urna a diam porttitor feugiat. Proin sed volutpat tortor. Vestibulum mauris neque, varius non accumsan suscipit, elementum vitae est.
    </Note>,
  )
