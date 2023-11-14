import React, { Children, cloneElement } from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import './HorizontalScroll.scss'

const HorizontalScroll = ({ className, innerMargin, outerMargin, scrollSnap, ...restProps }) => {
  const classes = styles('horizontal-scroll', {
    selectors: [
      className,
    ],
    modifiers: {
      innerMargin,
      outerMargin,
      scrollSnap,
    },
  })

  const children = Children.map(restProps.children, (child, index) => {
    if (child !== null) {
      return cloneElement(child, {
        key: index,
        className: `${child.props.className ? child.props.className : ''} horizontal-scroll__item`,
      })
    }
  })

  return <div className={classes}>
    {children}
  </div>
}

HorizontalScroll.propTypes = {
  className: PropTypes.string,
  innerMargin: PropTypes.string,
  outerMargin: PropTypes.string,
  scrollSnap: PropTypes.string, // center || left
}

HorizontalScroll.defaultProps = {
  className: '',
  innerMargin: 'none',
  outerMargin: 'none',
  scrollSnap: 'left',
}

export default HorizontalScroll
