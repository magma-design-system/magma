import React from 'react'
import PropTypes from 'prop-types'
import { appendSelectors, modifiers } from '@Library/styles'
import './HorizontalScroll.scss'

const HorizontalScroll = ({ innerMargin, outerMargin, scrollSnap, ...restProps }) => {
  const mainSelector = 'horizontal-scroll'
  const localClassNames = appendSelectors([
    mainSelector,
    restProps.className,
  ])

  const modifierClassNames = modifiers(mainSelector, {
    innerMargin,
    outerMargin,
    scrollSnap,
  })

  return <div className={`${localClassNames} ${modifierClassNames}`}>
    {
      React.Children.map(restProps.children, (child, index) => {
        return React.cloneElement(child, {
          key: index,
          className: child.props.className ? child.props.className + ' horizontal-scroll__item' : 'horizontal-scroll__item',
        })
      })
    }
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
