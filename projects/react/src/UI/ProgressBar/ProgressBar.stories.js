import React from 'react'
import faker from 'faker'

import ProgressBar from '@UI/ProgressBar/ProgressBar'
import InlineCode from '@UI/InlineCode/InlineCode'
import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@UI/Table/Table'

import sizesData from '@maggioli-design-system/design-tokens/dist/css-tokens/sizes.json'
import cosmeticsData from '@maggioli-design-system/design-tokens/dist/css-tokens/cosmetics.json'
const sizes = Object.keys(sizesData.size)
const borderRadius = Object.keys(cosmeticsData['border-radius'])

faker.locale = 'it'

export default {
  title: 'UI/ProgressBar',
  component: ProgressBar,
}

export const basicUsage = () =>
  <ProgressBar progress={faker.random.number(90)}/>

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

export const barRadius = () =>
  <Table interactive={true}>
    <TableHeader>
      <TableHeaderCell>Preview</TableHeaderCell>
      <TableHeaderCell>Size</TableHeaderCell>
    </TableHeader>
    <TableBody>
      {borderRadius.map(key =>
        <TableRow key={key}>
          <TableCell>
            <ProgressBar radius={key} size="xlarge" progress={faker.random.number(100)}/>
          </TableCell>
          <TableCell>
            <InlineCode>{`${key}`}</InlineCode>
          </TableCell>
        </TableRow>,
      )}
    </TableBody>
  </Table>

export const noRadius = () =>
  <ProgressBar progress={faker.random.number(90)} radius="none"/>

export const autoColor = () =>
  <ProgressBar progress={faker.random.number(100)} autoColor/>
