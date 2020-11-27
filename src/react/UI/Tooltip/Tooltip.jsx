import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import Grid from '@Layout/Grid/Grid'
import Icon from '@Design/Icon/Icon'
import './Tooltip.scss'

const TooltipBalloon = ({ onCancel, onConfirm, title, ...restProps }) => {
  onCancel()
  onConfirm()
  return <div className="tooltip__balloon">
    <Icon name="action-close" className="tooltip__icon"/>
    <H6 className="tooltip__title">{title}</H6>
    <Grid {...restProps} className="tooltip__contents">
      {restProps.children}
    </Grid>
  </div>
}

TooltipBalloon.propTypes = {
  ...Grid.propTypes,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
  title: PropTypes.string,
}

TooltipBalloon.defaultProps = {
  onCancel: null,
  onConfirm: null,
}

const Tooltip = ({ position, ...restProps }) => {
  const classes = styles('tooltip', {
    selectors: [
      restProps.className,
    ],
    modifiers: {
      position,
    },
  })

  return <div className={classes}>
    {restProps.children}
  </div>
}

Tooltip.propTypes = {
  ...TooltipBalloon.propTypes,
  className: PropTypes.string,
  position: PropTypes.string,
}

Tooltip.defaultProps = {
  className: '',
  position: 'right',
}

export default Tooltip
export {
  TooltipBalloon,
}
