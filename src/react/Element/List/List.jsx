import React from 'react'
import PropTypes from 'prop-types'
import './List.scss'

import Icon from '@Design/Icon/Icon'

import H5 from '@Typography/H5/H5'
import Paragraph from '@Typography/Paragraph/Paragraph'

/* eslint-disable no-nested-ternary */

const ListItem = props =>
  <Paragraph htmlTag="li" className={`list__item ${props.className}`}>
    {props.numeric
      ? <H5 className="list__numeric">{ props.id + 1 }.</H5>
      : <Icon className={`list__icon ${props.iconClassName}`} name={props.icon} size={props.iconSize}/>
    }
    <div className="list__text">
      {props.children}
      {props.autoPunctuation ? props.last ? '.' : ';' : ''}
    </div>
  </Paragraph>

ListItem.propTypes = {
  autoPunctuation: PropTypes.bool,
  className: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  iconSize: PropTypes.string,
  id: PropTypes.number,
  last: PropTypes.bool,
  numeric: PropTypes.bool,
}

ListItem.defaultProps = {
  autoPunctuation: false,
  className: '',
  icon: 'dot',
  iconClassName: '',
  iconSize: '',
  numeric: false,
}

const List = props =>
  <ul className={`list ${props.className} ${props.text}`}>
    {
      React.Children.map(props.children, (child, index) => {
        return React.cloneElement(child, {
          autoPunctuation: props.autoPunctuation,
          icon: child.props.icon === 'dot' ? props.icon : child.props.icon,
          iconClassName: child.props.iconClassName === '' ? props.iconClassName : child.props.iconClassName,
          iconSize: child.props.iconSize === '' ? props.iconSize : child.props.iconSize,
          id: index,
          last: props.children.length === index + 1,
          numeric: props.numeric,
        })
      })
    }
  </ul>

List.propTypes = {
  autoPunctuation: PropTypes.bool,
  className: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  iconSize: PropTypes.string,
  numeric: PropTypes.bool,
  text: PropTypes.string,
}

List.defaultProps = {
  autoPunctuation: false,
  className: '',
  icon: 'dot',
  iconClassName: '',
  iconSize: 'small',
  numeric: false,
  text: 'text-secondary text-secondary--paragraph',
}

export default List
export {
  ListItem,
}
