import React from 'react'
import PropTypes from 'prop-types'
import faker from 'faker'

import icons from './dictionary.json'
import Icon from './Icon'
faker.locale = 'it'

export default {
  title: 'Design/Icon',
  component: Icon,
}

const IconRow = props =>
  <tr>
    <td>
      <Icon {...props} />
    </td>
    <td>
      <code>{props.name}</code>
    </td>
  </tr>

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
  <table>
    <thead>
      <tr>
        <th>
          Icon
        </th>
        <th>
          Name
        </th>
      </tr>
    </thead>
    <tbody>
      {iconDictionary}
    </tbody>
  </table>

export const basicUsage = () =>
  <Icon name='user'/>

export const sizeSmall = () =>
  <Icon name='user' size='small'/>
