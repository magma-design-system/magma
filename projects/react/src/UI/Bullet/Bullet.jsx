import React from 'react'
import LabelDetail from '@Typography/LabelDetail/LabelDetail'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import './Bullet.scss'

const Bullet = ({ className, value, ...restProps }) => {
  const classes = styles('bullet', {
    selectors: [
      className,
    ],
  })

  return (
    <div className={classes}>
      <LabelDetail className="bullet__text">{restProps.children}</LabelDetail>
      { value && <LabelDetail className="bullet__value">{ value }</LabelDetail>}
    </div>
  )
}

Bullet.propTypes = {
  className: PropTypes.string,
  value: PropTypes.string,
}

export default Bullet
