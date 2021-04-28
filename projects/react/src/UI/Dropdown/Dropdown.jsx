import React, { Children, cloneElement, useState } from 'react'
import PropTypes from 'prop-types'
import useOnclickOutside from 'react-cool-onclickoutside'
import { styles } from '@Library/styles'
import './Dropdown.scss'

import Icon from '@Design/Icon/Icon'
import Row from '@Layout/Row/Row'
import Grid from '@Layout/Grid/Grid'
import H6 from '@Typography/H6/H6'

const DropdownItem = ({ className, icon, font, href, ...restProps }) => {
  const classes = styles('dropdown__item', {
    selectors: [
      className,
      'rounded',
    ],
  })

  return <Row htmlTag="a" href={href} className={classes}>
    { icon && <Icon className="dropdown__item-icon" name={icon}/> }
    <div className={`dropdown__text ${font}`}>{restProps.children}</div>
  </Row>
}

DropdownItem.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.string,
  font: PropTypes.string,
  href: PropTypes.string,
}

DropdownItem.defaultProps = {
  className: '',
}

const Dropdown = ({ className, description, direction, font, icon, label, pivot, ...restProps }) => {
  const [visible, setVisible] = useState(false)
  const ref = useOnclickOutside(() => {
    setVisible(false)
  })

  const handleClickBtn = () => {
    setVisible(!visible)
  }

  const children = Children.map(restProps.children, (child, index) => {
    if (child !== null) {
      return cloneElement(child, {
        key: index,
        font,
      })
    }
  })

  const classes = styles('dropdown', {
    selectors: [
      className,
    ],
    modifiers: {
      direction,
      visible,
    },
  })

  return <div className={classes}>
    <div ref={ref} className="dropdown__wrapper">
      { icon && <Row onClick={handleClickBtn} className="dropdown__toggler" gutter="xxsmall">
        <Icon className="dropdown__icon" name={icon}/>
        { description && <div className="dropdown__description">{ description }</div> }
      </Row> }
      <Grid className={`dropdown__list shadow ${pivot ? 'dropdown__list--pivot-' + pivot : ''}`} gutter="none">
        <H6 className="dropdown__header">{ label }</H6>
        <Grid className="p-2 bg-brand-maggioli-20" gutter="none">{children}</Grid>
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
  pivot: PropTypes.string,
}

Dropdown.defaultProps = {
  className: '',
  font: 'text-secondary text-secondary--caption',
  icon: 'menu-more',
  pivot: 'top-left',
}

export default Dropdown
export {
  DropdownItem,
}
