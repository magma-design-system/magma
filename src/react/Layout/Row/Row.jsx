import React, { Children, cloneElement } from 'react'
import PropTypes from 'prop-types'
import './Row.scss'

const Row = props =>
  <div onClick={props.onClick} className={`row ${props.className} ${props.gutter !== '' ? 'row--gutter-' + props.gutter : ''} ${props.align !== '' ? 'row--align-' + props.align : ''} ${props.lastToRight ? 'row--last-to-right' : ''} `}>
    {
      Children.map(props.children, (child, index) => {
        if (child !== null) {
          return cloneElement(child, {
            key: index,
            className: child.props.className ? `${child.props.className} row__item` : 'row__item',
          })
        }
      })
    }
  </div>

Row.propTypes = {
  align: PropTypes.string,
  className: PropTypes.string,
  gutter: PropTypes.string,
  lastToRight: PropTypes.bool,
  onClick: PropTypes.func,
}

Row.defaultProps = {
  align: 'center',
  lastToRight: false,
  className: '',
  gutter: 'xsmall',
}

export default Row
