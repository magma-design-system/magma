import React from 'react'
import PropTypes from 'prop-types'
import './Row.scss'

const Row = props =>
  <div className={`row ${props.className} ${props.gutter !== '' ? 'row--' + props.gutter : ''} ${props.align !== '' ? 'row--align-' + props.align : ''} `}>
    {
      React.Children.map(props.children, (child, index) => {
        return React.cloneElement(child, {
          key: index,
          className: child.props.className ? child.props.className + ' row__item' : 'row__item',
        })
      })
    }
  </div>

Row.propTypes = {
  align: PropTypes.string,
  className: PropTypes.string,
  gutter: PropTypes.string,
}

Row.defaultProps = {
  align: 'center',
  className: '',
  gutter: 'xsmall',
}

export default Row
