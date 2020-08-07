import React from 'react'

import FlashMessage from '@Pattern/Flash/Flash'
import Caption from '@Typography/Caption/Caption'
import Paragraph from '@Typography/Paragraph/Paragraph'

export default {
  title: 'Pattern/Flash',
  component: FlashMessage,
}

export const basicUsage = () =>
  <FlashMessage>
    <Caption></Caption>
  </FlashMessage>

export const statusInfo = () =>
  <FlashMessage status="info">
    <Paragraph></Paragraph>
  </FlashMessage>

export const statusWarning = () =>
  <FlashMessage status="warning">
    <Paragraph></Paragraph>
  </FlashMessage>

export const statusError = () =>
  <FlashMessage status="error">
    <Paragraph></Paragraph>
  </FlashMessage>

export const statusSuccess = () =>
  <FlashMessage status="success">
    <Paragraph></Paragraph>
  </FlashMessage>
