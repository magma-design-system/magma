import React from 'react'
import faker from 'faker'

import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@UI/Table/Table'

import Avatar from '@Content/Avatar/Avatar'
import InlineCode from '@UI/InlineCode/InlineCode'
import sizesData from '@maggioli-design-system/design-tokens/dist/css-tokens/sizes.json'

import avatarExample from './avatar-example.jpeg'

const avatarSizes = Object.keys(sizesData.avatar)
const gravatarDefs = [
  'mp',
  'identicon',
  'monsterid',
  'wavatar',
  'retro',
  'robohash',
]

faker.locale = 'it'

export default {
  title: 'Content/Avatar',
  component: Avatar,
}

export const basicUsage = () =>
  <Avatar src={avatarExample}/>

/*
mp
identicon
monsterid
wavatar
retro
robohash
*/

export const gravatar = () =>
  <Avatar gravatar="vittorio.vittori@maggioli.it?s=200"/>

export const gravatarDefaults = () =>
  <Table interactive={true}>
    <TableHeader>
      <TableHeaderCell>Preview</TableHeaderCell>
      <TableHeaderCell>Size</TableHeaderCell>
    </TableHeader>
    <TableBody>
      {gravatarDefs.map(key =>
        <TableRow>
          <TableCell>
            <Avatar key={key} gravatar={`not.exists@maggioli.it?s=200&d=${key}`}/>
          </TableCell>
          <TableCell>
            <InlineCode>{`${key}`}</InlineCode>
          </TableCell>
        </TableRow>,
      )}
    </TableBody>
  </Table>

export const sizes = () =>
  <Table interactive={true}>
    <TableHeader>
      <TableHeaderCell>Preview</TableHeaderCell>
      <TableHeaderCell>Size</TableHeaderCell>
    </TableHeader>
    <TableBody>
      {avatarSizes.map(key =>
        <TableRow>
          <TableCell>
            <Avatar key={key} size={key} src={require('./avatar-example.jpeg')}/>
          </TableCell>
          <TableCell>
            <InlineCode>{`${key}`}</InlineCode>
          </TableCell>
        </TableRow>,
      )}
    </TableBody>
  </Table>
