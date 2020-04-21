import React from 'react'
import faker from 'faker'

import Button from './Button'
import ThemeProvider from '@Design/Theme/ThemeProvider'

faker.locale = 'it'

export default {
  title: 'Form/Button',
  component: Button,
}

export const basicUsage = () =>
  <Button>{faker.hacker.verb()}</Button>

export const themeDark = () =>
  <ThemeProvider theme="dark">
    <Button>{faker.hacker.verb()}</Button>
  </ThemeProvider>

export const withIcon = () =>
  <Button icon="email">{faker.hacker.verb()}</Button>

export const disabled = () =>
  <Button icon="email" disabled={true}>{faker.hacker.verb()}</Button>

export const themed = () =>
  <ThemeProvider theme="pippo">
    <Button2>{faker.hacker.verb()}</Button2>
  </ThemeProvider>
