import React from 'react'
import PropTypes from 'prop-types'
import faker from 'faker'
import Icon from '@Design/Icon/Icon'
import Grid from '@Layout/Grid/Grid'
import mggIconsDictionary from '£Project/mgg-icons/src/mgg-icons.json'

import './Icon.stories.scss'
faker.locale = 'it'

export default {
  title: 'Design/Icon',
  component: Icon,
}

const IconRow = props =>
  <Grid className="icon-item" gutter="xsmall" htmlTag="label">
    <div><Icon {...props} /></div>
    <input onFocus={event => event.target.select()} className="icon-input text-mono text-mono--hack color-adjust-tone-c-08" type="text" readOnly={true} value={props.name} />
  </Grid>

IconRow.propTypes = {
  name: PropTypes.string,
}

IconRow.defaultProps = {
  name: '',
}

const iconDictionary = Object.entries(mggIconsDictionary).map(([key, value]) =>
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
