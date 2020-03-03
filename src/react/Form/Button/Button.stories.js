import React from 'react'
import faker from 'faker'

import Button from './Button'
import Button2 from './Button2'
import { ThemeContextProvider } from '../../Theme/ThemeProvider'

faker.locale = 'it'

export default {
  title: 'Form/Button',
  component: Button,
}

export const basicUsage = () =>
  <Button>{faker.hacker.verb()}</Button>

export const withIcon = () =>
  <Button icon="email">{faker.hacker.verb()}</Button>

export const disabled = () =>
  <Button icon="email" disabled={true}>{faker.hacker.verb()}</Button>

export const themed = () =>
  <ThemeContextProvider>
    <Button2>{faker.hacker.verb()}</Button2>
  </ThemeContextProvider>

