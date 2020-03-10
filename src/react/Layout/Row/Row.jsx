import React from 'react'
import PropTypes from 'prop-types'
import './Row.scss'

const Row = props =>
  <div className={`row ${props.className} ${props.gutter !== '' ? 'row--' + props.gutter : ''} `}>
    {
      React.Children.map(props.children, (child, index) => {
        return React.cloneElement(child, {
          key: index,
          className: 'row__child',
        })
      })
    }
  </div>

Row.propTypes = {
  className: PropTypes.string,
  gutter: PropTypes.string,
}

Row.defaultProps = {
  className: '',
  gutter: '',
}

export default Row
