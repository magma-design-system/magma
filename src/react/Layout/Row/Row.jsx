import React, { Children, cloneElement } from 'react'
import PropTypes from 'prop-types'
import './Row.scss'

const Row = props =>
  <div className={`row ${props.className} ${props.gutter !== '' ? 'row--' + props.gutter : ''} ${props.align !== '' ? 'row--align-' + props.align : ''} ${props.lastToRight ? 'row--last-to-right' : ''} `}>
    {
      Children.map(props.children, (child, index) => {
        return cloneElement(child, {
          key: index,
          className: child.props.className ? `${child.props.className} row__item` : 'row__item',
        })
      })
    }
  </div>

Row.propTypes = {
  align: PropTypes.string,
  lastToRight: PropTypes.bool,
  className: PropTypes.string,
  gutter: PropTypes.string,
}

Row.defaultProps = {
  align: 'center',
  lastToRight: false,
  className: '',
  gutter: 'xsmall',
}

export default Row
