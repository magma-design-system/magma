import React from 'react'
import PropTypes from 'prop-types'
import Color from './Color'
import Grid from '@Layout/Grid/Grid'
import './ColorMatrix.scss'

const ColorMatrix = props =>
  <Grid className="sys-color-matrix" columns={props.size === 'large' ? '3' : '4'}>
    {
      Object.entries(props.colors).map(([name, color]) => {
        if (props.filter && name.includes(props.filter)) {
          return (<Color name={name} color={color} />)
        } else if (!props.filter) {
          return (<Color name={name} color={color} />)
        }
      })
    }
  </Grid>

ColorMatrix.propTypes = {
  colors: PropTypes.obj,
  filter: PropTypes.string,
  size: PropTypes.string,
}

ColorMatrix.propTypes = {
  filter: false,
  size: 'large',
}

export default ColorMatrix
