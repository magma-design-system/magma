import React from 'react'
import faker from 'faker'

import FlashMessage from '@Element/Flash/Flash'

export default {
  title: 'Element/Flash',
  component: FlashMessage,
}

export const basicUsage = () =>
  <FlashMessage>
    {faker.lorem.paragraph()}
  </FlashMessage>

export const withCaption = () =>
  <FlashMessage className="text-secondary text-secondary--caption">
    {faker.lorem.paragraph()}
  </FlashMessage>

export const withParagraph = () =>
  <FlashMessage className="text-secondary text-secondary--paragraph">
    {faker.lorem.paragraph()}
  </FlashMessage>

export const statusInfo = () =>
  <FlashMessage status="info">
    {faker.lorem.paragraph()}
  </FlashMessage>

export const statusWarning = () =>
  <FlashMessage status="warning">
    {faker.lorem.paragraph()}
  </FlashMessage>

export const statusError = () =>
  <FlashMessage status="error">
    {faker.lorem.paragraph()}
  </FlashMessage>

export const statusSuccess = () =>
  <FlashMessage status="success">
    {faker.lorem.paragraph()}
  </FlashMessage>
