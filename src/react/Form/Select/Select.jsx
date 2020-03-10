import React from 'react'
import PropTypes from 'prop-types'
import './Select.scss'

const Select = props =>
  <div className={`select ${props.className}`}>
    { props.label &&
      <div className="select__label text-sans text-sans--h6">
        {props.label}
      </div>
    }
    <select className="select__field text-sans text-sans--paragraph" name={props.name}>
      { props.children }
    </select>
  </div>

Select.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
}

Select.defaultProps = {
  className: '',
  icon: '',
  label: '',
  name: 'unassigned',
}

export default Select
