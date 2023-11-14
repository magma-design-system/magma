import React from 'react'
import LabelCaption from '@Typography/LabelCaption/LabelCaption'
import Icon from '@Design/Icon/Icon'
import Row from '@Layout/Row/Row'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import './ChecklistItem.scss'

const ChecklistItem = ({ className, checked, iconChecked, iconUnchecked, ...restProps }) => {
  const classes = styles('checklist-item', {
    selectors: [
      className,
    ],
    modifiers: {
      checked,
    },
  })

  return (
    <Row align="flex-start" gutter="xxsmall" className={classes} {...restProps}>
      <Icon size="small" className="checklist-item__icon" name={checked ? iconChecked : iconUnchecked}/>
      <LabelCaption className="checklist-item__text">{restProps.children}</LabelCaption>
    </Row>
  )
}

ChecklistItem.propTypes = {
  className: PropTypes.string,
  checked: PropTypes.bool,
  iconChecked: PropTypes.string,
  iconUnchecked: PropTypes.string,
}

ChecklistItem.defaultProps = {
  checked: false,
  iconChecked: 'check-circle',
  iconUnchecked: 'remove-circle-outline',
}

export default ChecklistItem
