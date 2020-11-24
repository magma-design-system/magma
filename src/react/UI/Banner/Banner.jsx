import React from 'react'
import PropTypes from 'prop-types'
import './Banner.scss'

import Icon from '@Design/Icon/Icon'
import Row from '@Layout/Row/Row'

import dictionary from './dictionary.json'

const Banner = props => {
  const { background, color } = dictionary[props.status]
  return (
    <Row align="flex-start" className={`banner ${props.className} ${background} ${color}`}>
      <Icon name={ dictionary[props.status].icon }/>
      <div>{props.children}</div>
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
