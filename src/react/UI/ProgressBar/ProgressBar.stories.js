import React from 'react'
import faker from 'faker'

import ProgressBar from '@UI/ProgressBar/ProgressBar'
import InlineCode from '@UI/InlineCode/InlineCode'
import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@UI/Table/Table'

import sizesData from '+Tokens/css-tokens/sizes.json'
const sizes = Object.keys(sizesData.size)

faker.locale = 'it'

export default {
  title: 'UI/ProgressBar',
  component: ProgressBar,
}

export const basicUsage = () =>
  <ProgressBar progress={faker.random.number(90)}/>

export const rounded = () =>
  <ProgressBar progress={faker.random.number(90)} rounded={false}/>

export const customColors = () =>
  <ProgressBar progress={faker.random.number(90)} className="background-color-status-error-19" progressClassName="background-color-status-error-09"/>

export const barSizes = () =>
  <Table interactive={true}>
    <TableHeader>
      <TableHeaderCell>Preview</TableHeaderCell>
      <TableHeaderCell>Size</TableHeaderCell>
    </TableHeader>
    <TableBody>
      {sizes.map(key =>
        <TableRow key={key}>
          <TableCell>
            <ProgressBar size={key} progress={faker.random.number(100)}/>
          </TableCell>
          <TableCell>
            <InlineCode>{`${key}`}</InlineCode>
          </TableCell>
        </TableRow>,
      )}
    </TableBody>
  </Table>
