import React from 'react'
import List, { ListItem } from '@Element/List/List'

import faker from 'faker'
import randomIcon from '@Design/Icon/faker'

export default {
  title: 'Element/List',
  component: List,
}

export const basicUsage = () =>
  <List>
    <ListItem>{ faker.lorem.sentences() }</ListItem>
    <ListItem>{ faker.lorem.sentences() }</ListItem>
    <ListItem>{ faker.lorem.sentences() }</ListItem>
  </List>

export const iconSize = () =>
  <List iconSize="normal">
    <ListItem>{ faker.lorem.sentences() }</ListItem>
    <ListItem>{ faker.lorem.sentences() }</ListItem>
    <ListItem>{ faker.lorem.sentences() }</ListItem>
  </List>

export const customIconGlobal = () =>
  <List icon={randomIcon()}>
    <ListItem>{ faker.lorem.sentences() }</ListItem>
    <ListItem>{ faker.lorem.sentences() }</ListItem>
    <ListItem>{ faker.lorem.sentences() }</ListItem>
  </List>

export const customIconMultiple = () =>
  <List iconSize="normal">
    <ListItem icon={randomIcon()}>{ faker.internet.email() }</ListItem>
    <ListItem icon={randomIcon()}>{ faker.phone.phoneNumber() }</ListItem>
    <ListItem icon={randomIcon()}>{ faker.address.streetAddress() }</ListItem>
  </List>

export const customColorGlobal = () =>
  <List iconClassName="color-brand-maggioli-06" iconSize="normal">
    <ListItem icon={randomIcon()}>{ faker.internet.email() }</ListItem>
    <ListItem icon={randomIcon()}>{ faker.phone.phoneNumber() }</ListItem>
    <ListItem icon={randomIcon()}>{ faker.address.streetAddress() }</ListItem>
  </List>

export const customColorMultiple = () =>
  <List iconSize="normal">
    <ListItem icon={randomIcon()} iconClassName="color-brand-maggioli-08">{ faker.internet.email() }</ListItem>
    <ListItem icon={randomIcon()} iconClassName="color-status-warning-08">{ faker.phone.phoneNumber() }</ListItem>
    <ListItem icon={randomIcon()} iconClassName="color-status-success-08">{ faker.address.streetAddress() }</ListItem>
  </List>

export const numeric = () =>
  <List numeric={true}>
    <ListItem>{ faker.lorem.sentences() }</ListItem>
    <ListItem>{ faker.lorem.sentences() }</ListItem>
    <ListItem>{ faker.lorem.sentences() }</ListItem>
  </List>

export const autoPunctuation = () =>
  <List numeric={true} autoPunctuation={true}>
    <ListItem>{ faker.lorem.sentences().slice(0, -1) }</ListItem>
    <ListItem>{ faker.lorem.sentences().slice(0, -1) }</ListItem>
    <ListItem>{ faker.lorem.sentences().slice(0, -1) }</ListItem>
  </List>
