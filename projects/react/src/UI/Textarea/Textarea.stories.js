import React from 'react'
import faker from 'faker'
import randomIcon from '@Design/Icon/faker'
import Textarea from '@UI/Textarea/Textarea'
faker.locale = 'it'

export default {
  title: 'UI/Textarea',
  component: Textarea,
}

export const basicUsage = () =>
  <Textarea label={faker.lorem.sentence()} placeholder={faker.company.catchPhrase()}></Textarea>

export const noLabel = () =>
  <Textarea placeholder={faker.company.catchPhrase()}></Textarea>

export const customIcon = () =>
  <Textarea label={faker.lorem.sentence()} placeholder={faker.company.catchPhrase()} icon={randomIcon()}></Textarea>

export const Error = () =>
  <Textarea label={faker.lorem.sentence()} placeholder={faker.company.catchPhrase()} con={randomIcon()} error={faker.lorem.paragraph()}></Textarea>
