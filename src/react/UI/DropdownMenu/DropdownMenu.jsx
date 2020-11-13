import React, { Children, cloneElement, useState } from 'react'
import PropTypes from 'prop-types'
import useOnclickOutside from 'react-cool-onclickoutside'
import './DropdownMenu.scss'

import Icon from '@Design/Icon/Icon'
import Row from '@Layout/Row/Row'
import Grid from '@Layout/Grid/Grid'
import H6 from '@Typography/H6/H6'

const DropdownMenuItem = props =>
  <Row htmlTag="a" href={props.href} className="dropdown-menu__item">
    { props.icon && <Icon className="dropdown-menu__item-icon" name={props.icon}/> }
    <div className={`dropdown-menu__text ${props.font}`}>{props.children}</div>
  </Row>

DropdownMenuItem.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.string,
  label: PropTypes.string,
  pivot: PropTypes.string,
  font: PropTypes.string,
  href: PropTypes.string,
}

DropdownMenuItem.defaultProps = {
  className: '',
}

const DropdownMenu = props => {
  const [visible, setVisible] = useState(false)
  const ref = useOnclickOutside(() => {
    setVisible(false)
  })

  const handleClickBtn = () => {
    setVisible(!visible)
  }

  return <div className={`dropdown-menu ${props.className} ${visible ? 'dropdown-menu--visible' : ''} ${props.direction ? 'dropdown-menu--direction-' + props.direction : ''}`}>
    <div ref={ref} className="dropdown-menu__wrapper">
      { props.icon && <Row onClick={handleClickBtn} className="dropdown-menu__toggler" gutter="xxsmall">
        <Icon className="dropdown-menu__icon" name={props.icon}/>
        { props.description && <div className="dropdown-menu__description">{ props.description }</div> }
      </Row> }
      <Grid className={`dropdown-menu__list box-shadow-box ${props.pivot ? 'dropdown-menu__list--pivot-' + props.pivot : ''}`} gutter="none">
        <H6 className="dropdown-menu__header">{ props.label }</H6>
        {
          Children.map(props.children, (child, index) => {
            return cloneElement(child, {
              key: index,
              font: props.font,
            })
          })
        }
        <div className="dropdown-menu__footer"></div>
      </Grid>
    </div>
  </div>
}

DropdownMenu.propTypes = {
  className: PropTypes.string,
  description: PropTypes.string,
  direction: PropTypes.string,
  font: PropTypes.string,
  icon: PropTypes.string,
  label: PropTypes.string,
  onClick: PropTypes.func,
  pivot: PropTypes.string,
  visible: PropTypes.bool,
}

DropdownMenu.defaultProps = {
  className: '',
  font: 'text-secondary text-secondary--caption',
  icon: 'menu-more',
  onClick: () => {},
  pivot: 'top-left',
}

export default DropdownMenu
export {
  DropdownMenuItem,
}
