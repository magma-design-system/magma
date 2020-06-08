import React from 'react'
import PropTypes from 'prop-types'
import './Flash.scss'

import Icon from '@Design/Icon/Icon'
import Row from '@Layout/Row/Row'

import dictionary from './dictionary.json'

const Flash = props =>
  <Row align="flex-start" className={`flash ${props.className} ${dictionary[props.status].background} ${dictionary[props.status].color}`}>
    <Icon name={ dictionary[props.status].icon }/>
    {props.children}
  </Row>

Flash.propTypes = {
  className: PropTypes.string,
  status: PropTypes.string,
}

Flash.defaultProps = {
  className: '',
  status: 'info',
}

export default Flash
