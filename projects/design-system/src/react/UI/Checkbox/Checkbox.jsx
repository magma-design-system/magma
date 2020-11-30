import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import './Checkbox.scss'
import Icon from '@Design/Icon/Icon'

const Checkbox = ({ icon, iconClassName, isChecked, onChange, sync, textClassName, ...restProps }) => {
  const custom = icon ? { custom: true } : null
  const classes = styles('checkbox', {
    selectors: [
      restProps.className,
      textClassName,
    ],
    modifiers: {
      custom,
    },
  })

  return <label className={classes}>
    {!sync
      ? <input onChange={e => onChange(e.target.checked)} className="checkbox__field" defaultChecked={isChecked} type="checkbox" value="1"/>
      : <input onChange={e => onChange(e.target.checked)} className="checkbox__field" checked={isChecked} type="checkbox" value="1"/>
    }
    {icon
      ? <Fragment>
        <Icon className={`checkbox__icon ${iconClassName}`} name={icon}/>
        <Icon className={`checkbox__icon ${iconClassName}`} name={icon}/>
      </Fragment>
      : <Fragment>
        <Icon className={`checkbox__icon ${iconClassName}`} name="form-checkbox-unchecked"/>
        <Icon className={`checkbox__icon ${iconClassName}`} name="form-checkbox-checked"/>
      </Fragment>
    }
    <div className="checkbox__text">
      {restProps.children}
    </div>
  </label>
}

Checkbox.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.string,
  iconClassName: PropTypes.string,
  isChecked: PropTypes.bool,
  onChange: PropTypes.func,
  sync: PropTypes.bool,
  textClassName: PropTypes.string,
}

Checkbox.defaultProps = {
  className: '',
  icon: '',
  iconClassName: '',
  isChecked: false,
  sync: false,
  textClassName: 'text-secondary text-secondary--caption',
}

export default Checkbox
