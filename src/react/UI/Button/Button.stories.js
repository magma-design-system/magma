import React from 'react'
import faker from 'faker'
import randomIcon from '@Design/Icon/faker'

import Button from '@UI/Button/Button'
import Grid from '@Layout/Grid/Grid'

faker.locale = 'it'

export default {
  title: 'UI/Button',
  component: Button,
}

export const basicUsage = () =>
  <Button>{faker.hacker.verb()}</Button>

export const withIcon = () =>
  <Button icon={randomIcon()}>{faker.hacker.verb()}</Button>

export const smallSize = () =>
  <Button small={true}>{faker.hacker.verb()}</Button>

export const roundCorners = () =>
  <Button round={true}>{faker.hacker.verb()}</Button>

export const disabled = () =>
  <Button icon={randomIcon()} disabled={true}>{faker.hacker.verb()}</Button>

export const colors = () =>
  <Grid columns="3">
    <Grid columns="2">
      <Button icon={randomIcon()}>Primary</Button>
      <Button icon={randomIcon()} variant="primary-outline">Primary outline</Button>
      <Button icon={randomIcon()} variant="secondary">Secondary</Button>
      <Button icon={randomIcon()} variant="secondary-outline">Secondary outline</Button>
      <Button icon={randomIcon()} variant="info">Info</Button>
      <Button icon={randomIcon()} variant="info-outline">Info outline</Button>
      <Button icon={randomIcon()} variant="success">Success</Button>
      <Button icon={randomIcon()} variant="success-outline">Success outline</Button>
      <Button icon={randomIcon()} variant="warning">warning</Button>
      <Button icon={randomIcon()} variant="warning-outline">warning outline</Button>
      <Button icon={randomIcon()} variant="error">error</Button>
      <Button icon={randomIcon()} variant="error-outline">error outline</Button>
      <Button icon={randomIcon()} variant="link">Link</Button>
    </Grid>
  </Grid>
