import React from 'react'
import faker from 'faker'

import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@UI/Table/Table'

import Avatar from '@Content/Avatar/Avatar'
import InlineCode from '@UI/InlineCode/InlineCode'
import sizesData from '+Tokens/css-tokens/sizes.json'

const avatarSizes = Object.keys(sizesData.avatar)

faker.locale = 'it'

export default {
  title: 'Content/Avatar',
  component: Avatar,
}

export const basicUsage = () =>
  <Avatar url={require('./avatar-example.jpeg')}/>

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
            <Avatar key={key} size={key} url={require('./avatar-example.jpeg')}/>
          </TableCell>
          <TableCell>
            <InlineCode>{`${key}`}</InlineCode>
          </TableCell>
        </TableRow>,
      )}
    </TableBody>
  </Table>
