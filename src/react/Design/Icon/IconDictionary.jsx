import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@Layout/Grid/Grid'
import Icon from '@Design/Icon/Icon'
import './IconDictionary.scss'

import mggIconsDictionary from '£Project/mgg-icons/src/mgg-icons.json'

const IconRow = props =>
  <Grid className="icon-dictionary__item" gutter="xsmall" htmlTag="label">
    <div><Icon {...props} /></div>
    <input onFocus={event => event.target.select()} className="icon-dictionary__input text-mono text-mono--hack color-adjust-tone-c-08" type="text" readOnly={true} value={props.name} />
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

export const IconDictionary = () =>
  <div className="icon-dictionary" style={{ textAlign: 'center' }}>
    <Grid template="auto-fill">
      {iconDictionary}
    </Grid>
  </div>

export default IconDictionary
