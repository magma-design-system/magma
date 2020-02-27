import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import faker from 'faker'

import Page from '../../../Storybook/Page/Page'
import Button from './Button'

storiesOf('Policy App/Form/Button', module)
  .addDecorator(story => <Page>{story()}</Page>)
  .add('Default', () =>
    <Button onClick={action('clicked')}>{faker.hacker.verb()}</Button>,
  )
  .add('Icon + text', () =>
    <Button onClick={action('clicked')} icon="email">{faker.hacker.verb()}</Button>,
  )
  .add('Disabled', () =>
    <Button onClick={action('clicked')} icon="email" disabled={true}>{faker.hacker.verb()}</Button>,
  )
