import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import './ActionsBar.scss'

import Card from '@Layout/Card/Card'
import Grid from '@Layout/Grid/Grid'

const ActionsBarItems = props =>
  <Grid className="actions-bar__items" {...props}>{props.children}</Grid>

ActionsBarItems.propTypes = {
  ...Grid.propTypes,
}

ActionsBarItems.defaultProps = {
  template: 'auto-fit',
  gutter: 'small',
}

const ActionsBar = ({ position, notVisible, ...restProps }) => {
  const classes = styles('actions-bar', {
    selectors: [
      restProps.className,
    ],
    modifiers: {
      position,
      notVisible,
    },
  })

  return (
    <Card columns="2" className={classes} {...restProps}>
      {restProps.children}
    </Card>
  )
}

ActionsBar.propTypes = {
  ...Card.propTypes,
  position: PropTypes.string,
  notVisible: PropTypes.bool,
}

ActionsBar.defaultProps = {
  boxShadow: 'box',
  gutter: 'small',
  padding: 'small',
  position: 'right', // right || left || center,
}

export default ActionsBar
export {
  ActionsBarItems,
}
