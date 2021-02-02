import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import Row from '@Layout/Row/Row'
import Button from '@UI/Button/Button'
import './Tab.scss'

const TabItem = ({ active, borderRadius, className, ...restProps }) => {
  const classes = styles('tab__item', {
    selectors: [
      className,
      active ? 'transition background-color-brand-maggioli-05 color-adjust-tone-20' : 'transition background-color-adjust-tone-19 hover:background-color-adjust-tone-20 hover:box-shadow-box color-adjust-tone-04 hover:color-brand-maggioli-04',
    ],
    scaffolded: {
      borderRadius,
    },
  })

  return <Button className={classes} {...restProps}>
    {restProps.children}
  </Button>
}

TabItem.propTypes = {
  ...Button.propTypes,
  ...Row.propTypes,
  active: PropTypes.bool,
}

TabItem.defaultProps = {
  active: false,
  borderRadius: 'large',
}

const Tab = ({ borderRadius, className, padding, ...restProps }) => {
  const classes = styles('tab', {
    selectors: [
      className,
    ],
    scaffolded: {
      borderRadius,
      padding,
    },
  })

  return <Row className={classes} {...restProps}>
    {restProps.children}
  </Row>
}

Tab.propTypes = {
  ...Row.propTypes,
  borderRadius: PropTypes.string,
  current: PropTypes.number,
  padding: PropTypes.string,
}

Tab.defaultProps = {
  className: 'background-color-adjust-tone-19',
  gutter: 'xsmall',
  padding: 'xsmall',
  borderRadius: 'xlarge',
}

export default Tab
export {
  TabItem,
}
