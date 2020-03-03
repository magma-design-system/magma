import React from 'react'
import PropTypes from 'prop-types'
import faker from 'faker'

import icons from './dictionary.json'
import Icon from './Icon'
import Table, { TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@Layout/Table/Table'
faker.locale = 'it'

export default {
  title: 'Design/Icon',
  component: Icon,
}

const IconRow = props =>
  <TableRow>
    <TableCell align="center"><Icon {...props} /></TableCell>
    <TableCell><code>{props.name}</code></TableCell>
  </TableRow>

IconRow.propTypes = {
  name: PropTypes.string,
}

IconRow.defaultProps = {
  name: '',
}

const iconDictionary = Object.entries(icons).map(([key, value]) =>
  <IconRow key={key} name={key}/>,
)

export const dictionary = () =>
  <Table>
    <TableHeader>
      <TableHeaderCell>Icon</TableHeaderCell>
      <TableHeaderCell>Name</TableHeaderCell>
    </TableHeader>
    <TableBody>
      {iconDictionary}
    </TableBody>
  </Table>

export const basicUsage = () =>
  <Icon name='user'/>

export const sizeSmall = () =>
  <Icon name='user' size='small'/>
