import React from 'react'
import List, { ListItem } from './List'

import faker from 'faker'

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
  <List icon="statusWarning" iconSize="normal">
    <ListItem>{ faker.lorem.sentences() }</ListItem>
    <ListItem>{ faker.lorem.sentences() }</ListItem>
    <ListItem>{ faker.lorem.sentences() }</ListItem>
  </List>

export const customIconGlobal = () =>
  <List icon="statusWarning">
    <ListItem>{ faker.lorem.sentences() }</ListItem>
    <ListItem>{ faker.lorem.sentences() }</ListItem>
    <ListItem>{ faker.lorem.sentences() }</ListItem>
  </List>

export const customIconMultiple = () =>
  <List iconSize="normal">
    <ListItem icon="email">{ faker.internet.email() }</ListItem>
    <ListItem icon="smartphone">{ faker.phone.phoneNumber() }</ListItem>
    <ListItem icon="shipping">{ faker.address.streetAddress() }</ListItem>
  </List>

export const customColorGlobal = () =>
  <List iconClassName="color-brand-maggioli-06" iconSize="normal">
    <ListItem icon="email">{ faker.internet.email() }</ListItem>
    <ListItem icon="smartphone">{ faker.phone.phoneNumber() }</ListItem>
    <ListItem icon="shipping">{ faker.address.streetAddress() }</ListItem>
  </List>

export const customColorMultiple = () =>
  <List iconSize="normal">
    <ListItem icon="email" iconClassName="color-brand-maggioli-08">{ faker.internet.email() }</ListItem>
    <ListItem icon="statusWarning" iconClassName="color-status-warning-08">{ faker.phone.phoneNumber() }</ListItem>
    <ListItem icon="statusSuccess" iconClassName="color-status-success-08">{ faker.address.streetAddress() }</ListItem>
  </List>
