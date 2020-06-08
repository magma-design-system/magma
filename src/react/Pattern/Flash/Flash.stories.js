import React from 'react'

import Flash from './Flash'
import Caption from '@Typography/Caption/Caption'
import Paragraph from '@Typography/Paragraph/Paragraph'

export default {
  title: 'Pattern/Flash',
  component: Flash,
}

export const basicUsage = () =>
  <Flash>
    <Caption></Caption>
  </Flash>

export const statusInfo = () =>
  <Flash status="info">
    <Paragraph></Paragraph>
  </Flash>

export const statusWarning = () =>
  <Flash status="warning">
    <Paragraph></Paragraph>
  </Flash>

export const statusError = () =>
  <Flash status="error">
    <Paragraph></Paragraph>
  </Flash>

export const statusSuccess = () =>
  <Flash status="success">
    <Paragraph></Paragraph>
  </Flash>
