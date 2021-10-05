import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import Row from '@Layout/Row/Row'
import Button from '@UI/Button/Button'
import './Tab.scss'

const TabItem = ({ active, className, ...restProps }) => {
  const classes = styles('tab__item transition', {
    selectors: [
      className,
      active
        ? 'bg-brand-maggioli-05 rounded-full text-adjust-tone-20'
        : 'bg-transparent hover:bg-adjust-tone-20 hover:shadow hover:text-brand-maggioli-04 rounded-full text-adjust-tone-04',
    ],
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

const Tab = ({ className, ...restProps }) => {
  const classes = styles('tab', {
    selectors: [
      className,
      'p-3 rounded-full gap-1',
    ],
  })

  return <Row className={classes} {...restProps}>
    {restProps.children}
  </Row>
}

Tab.propTypes = {
  ...Row.propTypes,
  borderRadius: PropTypes.string,
  padding: PropTypes.string,
}

Tab.defaultProps = {
  className: 'bg-adjust-tone-19',
}

export default Tab
export {
  TabItem,
}
