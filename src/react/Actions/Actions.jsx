import React, { useState } from 'react'
import PropTypes from 'prop-types'
import './Actions.scss'
import Switch from '../Form/Switch/Switch'

const Actions = props => {
  const [expanded, toggleCheckbox] = useState(true)

  return (
    <div className={`actions ${props.className} ${props.show ? 'actions--active' : ''} ${expanded ? 'actions--expanded' : ''}`.trim()}>
      <header className="actions__header">
        <div className="actions__title">
          {props.title}
        </div>
        <Switch className="actions__switch" onChange={toggleCheckbox} isChecked={expanded}>
          {props.label}
        </Switch>
      </header>
      {props.children &&
        <div className="actions__container">
          <div className="actions__list">
            {props.children}
          </div>
        </div>
      }
    </div>
  )
}

Actions.propTypes = {
  className: PropTypes.string,
  show: PropTypes.bool,
  label: PropTypes.string,
  title: PropTypes.string,
}

Actions.defaultProps = {
  className: '',
  show: false,
  label: 'Espandi azioni disponibili',
  title: 'Azioni disponibili',
}

export default Actions
