import React from 'react'
import faker from 'faker'

import Banner from '@UI/Banner/Banner'

export default {
  title: 'UI/Banner',
  component: Banner,
}

export const basicUsage = () =>
  <Banner>
    {faker.lorem.paragraph()}
  </Banner>

export const withCaption = () =>
  <Banner className="text-secondary text-secondary--caption">
    {faker.lorem.paragraph()}
  </Banner>

export const withParagraph = () =>
  <Banner className="text-secondary text-secondary--paragraph">
    {faker.lorem.paragraph()}
  </Banner>

export const statusInfo = () =>
  <Banner status="info">
    {faker.lorem.paragraph()}
  </Banner>

export const statusWarning = () =>
  <Banner status="warning">
    {faker.lorem.paragraph()}
  </Banner>

export const statusError = () =>
  <Banner status="error">
    {faker.lorem.paragraph()}
  </Banner>

export const statusSuccess = () =>
  <Banner status="success">
    {faker.lorem.paragraph()}
  </Banner>
