import React from 'react'
import PropTypes from 'prop-types'
import './Flash.scss'

import Icon from '@Design/Icon/Icon'
import Row from '@Layout/Row/Row'

import dictionary from './dictionary.json'

const FlashMessage = props => {
  const { background, color } = dictionary[props.status]
  return (
    <Row align="flex-start" className={`flash ${props.className} ${background} ${color}`}>
      <Icon name={ dictionary[props.status].icon }/>
      <div>{props.children}</div>
    </Row>
  )
}

FlashMessage.propTypes = {
  className: PropTypes.string,
  status: PropTypes.string,
}

FlashMessage.defaultProps = {
  className: 'text-secondary text-secondary--detail',
  status: 'info',
}

export default FlashMessage
