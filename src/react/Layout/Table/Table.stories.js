import React from 'react'
import faker from 'faker'

import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from './Table'
faker.locale = 'it'

export default {
  title: 'Layout/Table',
  component: Table,
}

export const basicUsage = () =>
  <Table>
    <TableHeader>
      <TableHeaderCell>{faker.database.column()}</TableHeaderCell>
      <TableHeaderCell>{faker.database.column()}</TableHeaderCell>
      <TableHeaderCell>{faker.database.column()}</TableHeaderCell>
      <TableHeaderCell>{faker.database.column()}</TableHeaderCell>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell><b>{faker.name.findName()}</b></TableCell>
        <TableCell><code>{faker.internet.email()}</code></TableCell>
        <TableCell>{faker.phone.phoneNumber()}</TableCell>
        <TableCell>{faker.company.companyName()}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell><b>{faker.name.findName()}</b></TableCell>
        <TableCell><code>{faker.internet.email()}</code></TableCell>
        <TableCell>{faker.phone.phoneNumber()}</TableCell>
        <TableCell>{faker.company.companyName()}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell><b>{faker.name.findName()}</b></TableCell>
        <TableCell><code>{faker.internet.email()}</code></TableCell>
        <TableCell>{faker.phone.phoneNumber()}</TableCell>
        <TableCell>{faker.company.companyName()}</TableCell>
      </TableRow>
    </TableBody>
  </Table>

export const interactive = () =>
  <Table interactive={true}>
    <TableHeader>
      <TableHeaderCell>{faker.database.column()}</TableHeaderCell>
      <TableHeaderCell>{faker.database.column()}</TableHeaderCell>
      <TableHeaderCell>{faker.database.column()}</TableHeaderCell>
      <TableHeaderCell>{faker.database.column()}</TableHeaderCell>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell><b>{faker.name.findName()}</b></TableCell>
        <TableCell><code>{faker.internet.email()}</code></TableCell>
        <TableCell>{faker.phone.phoneNumber()}</TableCell>
        <TableCell>{faker.company.companyName()}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell><b>{faker.name.findName()}</b></TableCell>
        <TableCell><code>{faker.internet.email()}</code></TableCell>
        <TableCell>{faker.phone.phoneNumber()}</TableCell>
        <TableCell>{faker.company.companyName()}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell><b>{faker.name.findName()}</b></TableCell>
        <TableCell><code>{faker.internet.email()}</code></TableCell>
        <TableCell>{faker.phone.phoneNumber()}</TableCell>
        <TableCell>{faker.company.companyName()}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
