import React from 'react'
import faker from 'faker'
import randomIcon from '@Design/Icon/faker'

import Grid from '@Layout/Grid/Grid'

import Dropdown, { DropdownItem } from '@UI/Dropdown/Dropdown'

export default {
  title: 'UI/Dropdown',
  component: Dropdown,
}

const label = faker.lorem.word()
const description = faker.lorem.word()

export const basicUsage = () =>
  <Dropdown label={ label } description={ description }>
    <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
    <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
    <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
    <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
    <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
  </Dropdown>

export const hrefLinks = () =>
  <Dropdown label={ label } description={ description }>
    <DropdownItem href="#" icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
    <DropdownItem href="#" icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
    <DropdownItem href="#" icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
    <DropdownItem href="#" icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
    <DropdownItem href="#" icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
  </Dropdown>

export const pivotTopLeft = () =>
  <Dropdown label={ faker.lorem.word() } pivot="top-left">
    <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
    <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
    <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
    <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
    <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
  </Dropdown>

export const pivotTopRight = () =>
  <Grid columns="2">
    <div></div>
    <Dropdown label={ faker.lorem.word() } pivot="top-right">
      <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
      <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
      <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
      <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
      <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
    </Dropdown>
  </Grid>

export const pivotBottomRight = () =>
  <div style={{ height: '300px', width: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
    <Dropdown label={ faker.lorem.word() } pivot="bottom-right">
      <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
      <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
      <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
      <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
      <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
    </Dropdown>
  </div>

export const pivotBottomLeft = () =>
  <div style={{ height: '300px', width: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start' }}>
    <Dropdown label={ faker.lorem.word() } pivot="bottom-left">
      <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
      <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
      <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
      <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
      <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
    </Dropdown>
  </div>

export const direction = () =>
  <Grid columns="2">
    <div></div>
    <Dropdown direction="right" label={ faker.lorem.word() } pivot="top-right">
      <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
      <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
      <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
      <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
      <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
    </Dropdown>
  </Grid>

export const customIcon = () =>
  <Dropdown icon="user">
    <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
    <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
    <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
    <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
    <DropdownItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownItem>
  </Dropdown>
