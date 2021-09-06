import React from 'react'
import faker from 'faker'
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
    { faker.lorem.sentence() }
  </BenchmarkBar>

export const progressText = () =>
  <BenchmarkBar progress={faker.random.number(100)} progressText="Good">
    { faker.lorem.sentence() }
  </BenchmarkBar>

export const barSize = () =>
  <BenchmarkBar progress={faker.random.number(100)} size="small">
    Checkout ProgressBar for all sizes
  </BenchmarkBar>

export const decimals = () =>
  <BenchmarkBar progress="33.75" size="small" decimals>
    Checkout ProgressBar for all sizes
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
            This is a very low value, i'm sorry.
          </BenchmarkBar>
        </TableCell>
        <TableCell>
          <span>Under <InlineCode>39%</InlineCode></span>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          <BenchmarkBar progress="69" autoColor>
            This is a middle value, not bad.
          </BenchmarkBar>
        </TableCell>
        <TableCell>
          <span>Under <InlineCode>69%</InlineCode></span>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          <BenchmarkBar progress="70" autoColor>
            This is a high value, yeah!
          </BenchmarkBar>
        </TableCell>
        <TableCell>
          <span>Over <InlineCode>70%</InlineCode></span>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
