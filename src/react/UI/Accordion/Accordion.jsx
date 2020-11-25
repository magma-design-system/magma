import React, { Children, cloneElement } from 'react'
import PropTypes from 'prop-types'
import './Accordion.scss'

import H3 from '@Typography/H3/H3'
import Icon from '@Design/Icon/Icon'

const AccordionItem = props =>
  <div className={`accordion__item ${props.className} ${props.isOpened ? 'accordion__item--is-opened' : ''}`}>
    <header className="accordion__header">
      {props.icon && <Icon name={props.icon} className="accordion__icon"/>}
      <H3 className="accordion__title">{props.title}</H3>
      <div className="accordion__toggle">
        <Icon name={props.isOpened ? 'navigation-hide' : 'navigation-show'} className="accordion__action"/>
      </div>
    </header>
    <section className="accordion__body">
      <div className="accordion__content">
        {props.children}
      </div>
    </section>
  </div>

AccordionItem.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.string,
  isOpened: PropTypes.bool,
  title: PropTypes.string,
}

AccordionItem.defaultProps = {
  className: '',
  isOpened: false,
}

const Accordion = props => {
  const children = Children.map(props.children, (child, index) => {
    if (child !== null) {
      return cloneElement(child, {
        key: index,
        onClick: () => console.log(index),
      })
    }
  })

  return (
    <div className={`accordion ${props.className}`}>
      {children}
    </div>
  )
}

Accordion.propTypes = {
  className: PropTypes.string,
  initialItem: PropTypes.number,
}

Accordion.defaultProps = {
  className: '',
  initialItem: 0,
}

export default Accordion
export {
  AccordionItem,
}
