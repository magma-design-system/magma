import React from 'react'
import faker from 'faker'

import Button from '@Pattern/Button/Button'
import Grid from '@Layout/Grid/Grid'

faker.locale = 'it'

export default {
  title: 'Element/Button',
  component: Button,
}

export const basicUsage = () =>
  <Button>{faker.hacker.verb()}</Button>

export const withIcon = () =>
  <Button icon="email">{faker.hacker.verb()}</Button>

export const smallSize = () =>
  <Button small={true}>{faker.hacker.verb()}</Button>

export const roundCorners = () =>
  <Button round={true}>{faker.hacker.verb()}</Button>

export const disabled = () =>
  <Button icon="logout" disabled={true}>{faker.hacker.verb()}</Button>

export const colors = () =>
  <Grid columns="3">
    <Grid columns="2">
      <Button icon="email">Primary</Button>
      <Button icon="email" variant="primary-outline">Primary outline</Button>
      <Button icon="notification" variant="secondary">Secondary</Button>
      <Button icon="notification" variant="secondary-outline">Secondary outline</Button>
      <Button icon="user" variant="info">Info</Button>
      <Button icon="user" variant="info-outline">Info outline</Button>
      <Button icon="operator" variant="success">Success</Button>
      <Button icon="operator" variant="success-outline">Success outline</Button>
      <Button icon="phone" variant="warning">warning</Button>
      <Button icon="phone" variant="warning-outline">warning outline</Button>
      <Button icon="shipping" variant="error">error</Button>
      <Button icon="shipping" variant="error-outline">error outline</Button>
      <Button icon="license" variant="link">Link</Button>
    </Grid>
  </Grid>
