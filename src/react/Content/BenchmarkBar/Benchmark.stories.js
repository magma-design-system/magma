import React from 'react'
import faker from 'faker'
import Caption from '@Typography/Caption/Caption'
import BenchmarkBar from '@Content/BenchmarkBar/BenchmarkBar'
import InlineCode from '@UI/InlineCode/InlineCode'
import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@UI/Table/Table'

faker.locale = 'it'

export default {
  title: 'Content/BenchmarkBar',
  component: BenchmarkBar,
}

export const basicUsage = () =>
  <BenchmarkBar progress={faker.random.number(100)}>
    <Caption>{ faker.lorem.sentence() }</Caption>
  </BenchmarkBar>

export const barSize = () =>
  <BenchmarkBar progress={faker.random.number(100)} size="small">
    <Caption>Checkout ProgressBar for all sizes</Caption>
  </BenchmarkBar>

export const autoColor = () =>
  <Table interactive={true}>
    <TableHeader>
      <TableHeaderCell>Preview</TableHeaderCell>
      <TableHeaderCell>Size</TableHeaderCell>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>
          <BenchmarkBar progress="39" autoColor>
            <Caption>This is a very low value, i'm sorry.</Caption>
          </BenchmarkBar>
        </TableCell>
        <TableCell>
          <span>Under <InlineCode>39%</InlineCode></span>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          <BenchmarkBar progress="69" autoColor>
            <Caption>This is a middle value, not bad.</Caption>
          </BenchmarkBar>
        </TableCell>
        <TableCell>
          <span>Under <InlineCode>69%</InlineCode></span>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          <BenchmarkBar progress="70" autoColor>
            <Caption>This is a high value, yeah!</Caption>
          </BenchmarkBar>
        </TableCell>
        <TableCell>
          <span>Over <InlineCode>70%</InlineCode></span>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
