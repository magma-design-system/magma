import React from 'react'
import UList, { UListItem } from '@UI/UList/UList'

import faker from 'faker'
import randomIcon from '@Design/Icon/faker'

export default {
  title: 'UI/UList',
  component: UList,
}

export const basicUsage = () =>
  <UList>
    <UListItem>{ faker.lorem.sentences() }</UListItem>
    <UListItem>{ faker.lorem.sentences() }</UListItem>
    <UListItem>{ faker.lorem.sentences() }</UListItem>
  </UList>

export const iconSize = () =>
  <UList iconSize="normal">
    <UListItem>{ faker.lorem.sentences() }</UListItem>
    <UListItem>{ faker.lorem.sentences() }</UListItem>
    <UListItem>{ faker.lorem.sentences() }</UListItem>
  </UList>

export const customIconGlobal = () =>
  <UList icon={randomIcon()}>
    <UListItem>{ faker.lorem.sentences() }</UListItem>
    <UListItem>{ faker.lorem.sentences() }</UListItem>
    <UListItem>{ faker.lorem.sentences() }</UListItem>
  </UList>

export const customIconMultiple = () =>
  <UList iconSize="normal">
    <UListItem icon={randomIcon()}>{ faker.internet.email() }</UListItem>
    <UListItem icon={randomIcon()}>{ faker.phone.phoneNumber() }</UListItem>
    <UListItem icon={randomIcon()}>{ faker.address.streetAddress() }</UListItem>
  </UList>

export const customColorGlobal = () =>
  <UList iconClassName="color-brand-maggioli-06" iconSize="normal">
    <UListItem icon={randomIcon()}>{ faker.internet.email() }</UListItem>
    <UListItem icon={randomIcon()}>{ faker.phone.phoneNumber() }</UListItem>
    <UListItem icon={randomIcon()}>{ faker.address.streetAddress() }</UListItem>
  </UList>

export const customColorMultiple = () =>
  <UList iconSize="normal">
    <UListItem icon={randomIcon()} iconClassName="color-brand-maggioli-08">{ faker.internet.email() }</UListItem>
    <UListItem icon={randomIcon()} iconClassName="color-status-warning-08">{ faker.phone.phoneNumber() }</UListItem>
    <UListItem icon={randomIcon()} iconClassName="color-status-success-08">{ faker.address.streetAddress() }</UListItem>
  </UList>

export const numeric = () =>
  <UList numeric={true}>
    <UListItem>{ faker.lorem.sentences() }</UListItem>
    <UListItem>{ faker.lorem.sentences() }</UListItem>
    <UListItem>{ faker.lorem.sentences() }</UListItem>
  </UList>

export const autoPunctuation = () =>
  <UList numeric={true} autoPunctuation={true}>
    <UListItem>{ faker.lorem.sentences().slice(0, -1) }</UListItem>
    <UListItem>{ faker.lorem.sentences().slice(0, -1) }</UListItem>
    <UListItem>{ faker.lorem.sentences().slice(0, -1) }</UListItem>
  </UList>
