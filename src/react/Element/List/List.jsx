import React from 'react'
import PropTypes from 'prop-types'
import './List.scss'

import Icon from '@Design/Icon/Icon'

const ListItem = props =>
  <li className={`list__item ${props.className}`}>
    <Icon className={`list__icon ${props.iconClassName}`} name={props.icon} size={props.iconSize}/>
    <div className="list__text">{props.children}</div>
  </li>

ListItem.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  iconSize: PropTypes.string,
}

ListItem.defaultProps = {
  className: '',
  icon: 'dot',
  iconClassName: '',
  iconSize: '',
}

const List = props =>
  <ul className={`list ${props.className} ${props.text}`}>
    {
      React.Children.map(props.children, (child, index) => {
        return React.cloneElement(child, {
          key: index,
          icon: child.props.icon === 'dot' ? props.icon : child.props.icon,
          iconClassName: child.props.iconClassName === '' ? props.iconClassName : child.props.iconClassName,
          iconSize: child.props.iconSize === '' ? props.iconSize : child.props.iconSize,
        })
      })
    }
  </ul>

List.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  iconSize: PropTypes.string,
  text: PropTypes.string,
}

List.defaultProps = {
  className: '',
  icon: 'dot',
  iconClassName: '',
  iconSize: 'small',
  text: 'text-secondary text-secondary--paragraph',
}

export default List
export {
  ListItem,
}
