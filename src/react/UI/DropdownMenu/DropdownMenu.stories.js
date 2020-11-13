import React from 'react'
import faker from 'faker'
import randomIcon from '@Design/Icon/faker'

import Grid from '@Layout/Grid/Grid'

import DropdownMenu, { DropdownMenuItem } from '@UI/DropdownMenu/DropdownMenu'

export default {
  title: 'UI/DropdownMenu',
  component: DropdownMenu,
}

const label = faker.lorem.word()
const description = faker.lorem.word()

export const basicUsage = () =>
  <DropdownMenu label={ label } description={ description }>
    <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
    <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
    <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
    <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
    <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
  </DropdownMenu>

export const hrefLinks = () =>
  <DropdownMenu label={ label } description={ description }>
    <DropdownMenuItem href="#" icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
    <DropdownMenuItem href="#" icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
    <DropdownMenuItem href="#" icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
    <DropdownMenuItem href="#" icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
    <DropdownMenuItem href="#" icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
  </DropdownMenu>

export const pivotTopLeft = () =>
  <DropdownMenu label={ faker.lorem.word() } pivot="top-left">
    <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
    <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
    <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
    <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
    <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
  </DropdownMenu>

export const pivotTopRight = () =>
  <Grid columns="2">
    <div></div>
    <DropdownMenu label={ faker.lorem.word() } pivot="top-right">
      <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
      <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
      <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
      <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
      <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
    </DropdownMenu>
  </Grid>

export const pivotBottomRight = () =>
  <div style={{ height: '300px', width: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
    <DropdownMenu label={ faker.lorem.word() } pivot="bottom-right">
      <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
      <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
      <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
      <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
      <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
    </DropdownMenu>
  </div>

export const pivotBottomLeft = () =>
  <div style={{ height: '300px', width: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start' }}>
    <DropdownMenu label={ faker.lorem.word() } pivot="bottom-left">
      <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
      <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
      <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
      <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
      <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
    </DropdownMenu>
  </div>

export const direction = () =>
  <Grid columns="2">
    <div></div>
    <DropdownMenu direction="right" label={ faker.lorem.word() } pivot="top-right">
      <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
      <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
      <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
      <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
      <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
    </DropdownMenu>
  </Grid>

export const customIcon = () =>
  <DropdownMenu icon="user">
    <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
    <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
    <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
    <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
    <DropdownMenuItem icon={randomIcon()}>{ faker.lorem.words() }</DropdownMenuItem>
  </DropdownMenu>
