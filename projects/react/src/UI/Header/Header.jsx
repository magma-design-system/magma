import React from 'react'
import PropTypes from 'prop-types'
import Row from '@Layout/Row/Row'
import './Header.scss'

import { styles } from '@Library/styles'

const Header = ({ className, boxShadow, ...restProps }) => {
  const classes = styles('header', {
    selectors: [
      className,
    ],
    scaffolded: {
      boxShadow,
    },
  })

  return <Row {...restProps} className={classes}>
    {restProps.children}
  </Row>
}

Header.propTypes = {
  ...Row.propTypes,
  boxShadow: PropTypes.string,
  className: PropTypes.string,
}

Header.defaultProps = {
  boxShadow: 'soft',
}

export default Header
