import React from 'react'
import PropTypes from 'prop-types'
import faker from 'faker'

import icons from './dictionary.json'
import Icon from './Icon'
import Grid from '@Layout/Grid/Grid'
import Hack from '@Typography/Hack/Hack'
faker.locale = 'it'

export default {
  title: 'Design/Icon',
  component: Icon,
}

const IconRow = props =>
  <Grid gutter="xsmall">
    <div><Icon {...props} /></div>
    <Hack className="color-adjust-tone-c-08">{props.name}</Hack>
  </Grid>

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
  <div style={{ textAlign: 'center' }}>
    <Grid columns="auto">
      {iconDictionary}
    </Grid>
  </div>

export const basicUsage = () =>
  <Icon name='user'/>

export const sizeSmall = () =>
  <Icon name='user' size='small'/>
