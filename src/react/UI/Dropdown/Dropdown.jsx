import React, { Children, cloneElement, useState } from 'react'
import PropTypes from 'prop-types'
import useOnclickOutside from 'react-cool-onclickoutside'
import './Dropdown.scss'

import Icon from '@Design/Icon/Icon'
import Row from '@Layout/Row/Row'
import Grid from '@Layout/Grid/Grid'
import H6 from '@Typography/H6/H6'

const DropdownItem = props =>
  <Row htmlTag="a" href={props.href} className="dropdown__item">
    { props.icon && <Icon className="dropdown__item-icon" name={props.icon}/> }
    <div className={`dropdown__text ${props.font}`}>{props.children}</div>
  </Row>

DropdownItem.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.string,
  label: PropTypes.string,
  pivot: PropTypes.string,
  font: PropTypes.string,
  href: PropTypes.string,
}

DropdownItem.defaultProps = {
  className: '',
}

const Dropdown = props => {
  const [visible, setVisible] = useState(false)
  const ref = useOnclickOutside(() => {
    setVisible(false)
  })

  const handleClickBtn = () => {
    setVisible(!visible)
  }

  return <div className={`dropdown ${props.className} ${visible ? 'dropdown--visible' : ''} ${props.direction ? 'dropdown--direction-' + props.direction : ''}`}>
    <div ref={ref} className="dropdown__wrapper">
      { props.icon && <Row onClick={handleClickBtn} className="dropdown__toggler" gutter="xxsmall">
        <Icon className="dropdown__icon" name={props.icon}/>
        { props.description && <div className="dropdown__description">{ props.description }</div> }
      </Row> }
      <Grid className={`dropdown__list box-shadow-box ${props.pivot ? 'dropdown__list--pivot-' + props.pivot : ''}`} gutter="none">
        <H6 className="dropdown__header">{ props.label }</H6>
        {
          Children.map(props.children, (child, index) => {
            return cloneElement(child, {
              key: index,
              font: props.font,
            })
          })
        }
        <div className="dropdown__footer"></div>
      </Grid>
    </div>
  </div>
}

Dropdown.propTypes = {
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

Dropdown.defaultProps = {
  className: '',
  font: 'text-secondary text-secondary--caption',
  icon: 'menu-more',
  onClick: () => {},
  pivot: 'top-left',
}

export default Dropdown
export {
  DropdownItem,
}
