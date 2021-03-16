import React from 'react'
import faker from 'faker'
import randomIcon from '@Design/Icon/faker'

import Tag from '@UI/Tag/Tag'
import Paragraph from '@Typography/Paragraph/Paragraph'
import Detail from '@Typography/Detail/Detail'
import InlineCode from '@UI/InlineCode/InlineCode'
import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@UI/Table/Table'

import sizes from '+Tokens/css-tokens/sizes.json'

faker.locale = 'it'

export default {
  title: 'UI/Tag',
  component: Tag,
}

export const basicUsage = () =>
  <Tag icon={randomIcon()}>
    <Paragraph>{faker.lorem.word()}</Paragraph>
  </Tag>

export const customIconColor = () =>
  <Tag iconClassName="color-status-success-09">
    <Paragraph>{faker.lorem.word()}</Paragraph>
  </Tag>

export const customIcon = () =>
  <Tag icon={randomIcon()}>
    <Paragraph>{faker.lorem.word()}</Paragraph>
  </Tag>

export const chipTag = () =>
  <Tag chip icon={randomIcon()}>
    <Paragraph>{faker.lorem.word()}</Paragraph>
  </Tag>

export const chipColors = () =>
  <Tag icon={randomIcon()} chip iconClassName="color-status-warning-09" className="color-status-warning-04 background-color-status-warning-18">
    <Detail>{faker.lorem.word()}</Detail>
  </Tag>

export const size = () =>
  <Table interactive>
    <TableHeader>
      <TableHeaderCell>Preview</TableHeaderCell>
      <TableHeaderCell>Size</TableHeaderCell>
    </TableHeader>
    <TableBody>
      {Object.entries(sizes.size).map(([key]) =>
        <TableRow>
          <TableCell>
            <Tag icon={randomIcon()} chip size={key}>Tag {key}</Tag>
          </TableCell>
          <TableCell>
            <InlineCode>{`${key}`}</InlineCode>
          </TableCell>
        </TableRow>,
      )}
    </TableBody>
  </Table>
