import React, { Children, cloneElement, useRef } from 'react'
import { gsap } from 'gsap'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import Grid from '@Layout/Grid/Grid'
import Card from '@Layout/Card/Card'
import Icon from '@Design/Icon/Icon'
import H6 from '@Typography/H6/H6'
import './Tooltip.scss'

const TooltipBalloon = ({ onCancel, onConfirm, title, ...restProps }) => {
  onCancel()
  onConfirm()
  return <Card padding="small" borderRadius="small" boxShadow="box" className="tooltip__balloon">
    <Icon name="action-close" className="tooltip__icon"/>
    { title && <H6 className="tooltip__title">{title}</H6> }
    <Grid {...restProps} className="tooltip__contents">
      {restProps.children}
    </Grid>
  </Card>
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

const Tooltip = ({ className, position, ...restProps }) => {
  const classes = styles('tooltip', {
    selectors: [
      className,
    ],
    modifiers: {
      position,
    },
  })

  const tooltipRef = useRef()
  const children = Children.map(restProps.children, child => {
    if (child !== null) {
      return cloneElement(child, {
        ref: child.type.name === 'TooltipBalloon' ? tooltipRef : null,
      })
    }
  })

  const showTooltip = () => {
    gsap.to(tooltipRef.current, {
      alpha: 0,
      ease: 'none',
      delay: 0.5,
    })
  }

  return <div className={classes} onMouseEnter={showTooltip}>
    {children}
  </div>
}

Tooltip.propTypes = {
  ...TooltipBalloon.propTypes,
  className: PropTypes.string,
  position: PropTypes.string,
}

Tooltip.defaultProps = {
  className: '',
  position: 'top',
}

export default Tooltip
export {
  TooltipBalloon,
}
