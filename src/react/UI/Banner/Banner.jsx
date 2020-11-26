import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import './Banner.scss'

import Icon from '@Design/Icon/Icon'
import Row from '@Layout/Row/Row'

import dictionary from './dictionary.json'

const Banner = ({ status, ...restProps }) => {
  const { background, color } = dictionary[status]
  const classes = styles('banner', {
    selectors: [
      restProps.className,
      background,
      color,
    ],
  })

  return (
    <Row align="flex-start" className={classes}>
      <Icon className="banner__icon" name={ dictionary[status].icon }/>
      <div>{restProps.children}</div>
    </Row>
  )
}

Banner.propTypes = {
  className: PropTypes.string,
  status: PropTypes.string,
}

Banner.defaultProps = {
  className: 'text-secondary text-secondary--detail',
  status: 'info',
}

export default Banner
