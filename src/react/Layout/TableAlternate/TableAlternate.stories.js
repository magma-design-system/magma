import React from 'react'
import faker from 'faker'

import TableAlternate, { TableAltHeader, TableAltHeaderCell, TableAltBody, TableAltRow, TableAltCell } from './TableAlternate'
faker.locale = 'it'

export default {
  title: 'Layout/Table alternate',
  component: TableAlternate,
}

export const basicUsage = () =>
  <TableAlternate>
    <TableAltHeader>
      <TableAltHeaderCell>{faker.database.column()}</TableAltHeaderCell>
      <TableAltHeaderCell>{faker.database.column()}</TableAltHeaderCell>
      <TableAltHeaderCell>{faker.database.column()}</TableAltHeaderCell>
      <TableAltHeaderCell>{faker.database.column()}</TableAltHeaderCell>
    </TableAltHeader>
    <TableAltBody>
      <TableAltRow>
        <TableAltCell><b>{faker.name.findName()}</b></TableAltCell>
        <TableAltCell><code>{faker.internet.email()}</code></TableAltCell>
        <TableAltCell>{faker.phone.phoneNumber()}</TableAltCell>
        <TableAltCell>{faker.company.companyName()}</TableAltCell>
      </TableAltRow>
      <TableAltRow>
        <TableAltCell><b>{faker.name.findName()}</b></TableAltCell>
        <TableAltCell><code>{faker.internet.email()}</code></TableAltCell>
        <TableAltCell>{faker.phone.phoneNumber()}</TableAltCell>
        <TableAltCell>{faker.company.companyName()}</TableAltCell>
      </TableAltRow>
      <TableAltRow>
        <TableAltCell><b>{faker.name.findName()}</b></TableAltCell>
        <TableAltCell><code>{faker.internet.email()}</code></TableAltCell>
        <TableAltCell>{faker.phone.phoneNumber()}</TableAltCell>
        <TableAltCell>{faker.company.companyName()}</TableAltCell>
      </TableAltRow>
    </TableAltBody>
  </TableAlternate>

export const interactive = () =>
  <TableAlternate interactive={true}>
    <TableAltHeader>
      <TableAltHeaderCell>{faker.database.column()}</TableAltHeaderCell>
      <TableAltHeaderCell>{faker.database.column()}</TableAltHeaderCell>
      <TableAltHeaderCell>{faker.database.column()}</TableAltHeaderCell>
      <TableAltHeaderCell>{faker.database.column()}</TableAltHeaderCell>
    </TableAltHeader>
    <TableAltBody>
      <TableAltRow>
        <TableAltCell><b>{faker.name.findName()}</b></TableAltCell>
        <TableAltCell><code>{faker.internet.email()}</code></TableAltCell>
        <TableAltCell>{faker.phone.phoneNumber()}</TableAltCell>
        <TableAltCell>{faker.company.companyName()}</TableAltCell>
      </TableAltRow>
      <TableAltRow>
        <TableAltCell><b>{faker.name.findName()}</b></TableAltCell>
        <TableAltCell><code>{faker.internet.email()}</code></TableAltCell>
        <TableAltCell>{faker.phone.phoneNumber()}</TableAltCell>
        <TableAltCell>{faker.company.companyName()}</TableAltCell>
      </TableAltRow>
      <TableAltRow>
        <TableAltCell><b>{faker.name.findName()}</b></TableAltCell>
        <TableAltCell><code>{faker.internet.email()}</code></TableAltCell>
        <TableAltCell>{faker.phone.phoneNumber()}</TableAltCell>
        <TableAltCell>{faker.company.companyName()}</TableAltCell>
      </TableAltRow>
    </TableAltBody>
  </TableAlternate>
