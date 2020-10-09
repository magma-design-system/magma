import React from 'react'
import PropTypes from 'prop-types'
import './HorizontalScroll.scss'

const HorizontalScroll = props =>
  <div className={`horizontal-scroll ${props.className} ${props.smooth ? 'horizontal-scroll--smooth' : ''} ${props.innerMargin ? 'horizontal-scroll--inner-margin' : ''} ${props.outerMargin ? 'horizontal-scroll--outer-margin' : ''}`}>
    {
      React.Children.map(props.children, (child, index) => {
        return React.cloneElement(child, {
          key: index,
          className: child.props.className ? child.props.className + ' horizontal-scroll__item' : 'horizontal-scroll__item',
        })
      })
    }
  </div>

HorizontalScroll.propTypes = {
  className: PropTypes.string,
  innerMargin: PropTypes.bool,
  outerMargin: PropTypes.bool,
  smooth: PropTypes.bool,
}

HorizontalScroll.defaultProps = {
  className: '',
  innerMargin: false,
  outerMargin: false,
  smooth: false,
}

export default HorizontalScroll
