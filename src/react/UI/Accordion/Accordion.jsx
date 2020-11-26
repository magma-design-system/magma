import React, { Children, cloneElement } from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import './Accordion.scss'

import H3 from '@Typography/H3/H3'
import Icon from '@Design/Icon/Icon'

const AccordionItem = ({ icon, opened, title, ...restProps }) => {
  const classes = styles('accordion__item', {
    selectors: [
      restProps.className,
    ],
    modifiers: {
      opened,
    },
  })
  return <div className={classes}>
    <header className="accordion__header">
      {icon && <Icon name={icon} className="accordion__icon"/>}
      <H3 className="accordion__title">{title}</H3>
      <div className="accordion__toggle">
        <Icon name={opened ? 'navigation-hide' : 'navigation-show'} className="accordion__action"/>
      </div>
    </header>
    <section className="accordion__body">
      <div className="accordion__content">
        {restProps.children}
      </div>
    </section>
  </div>
}

AccordionItem.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.string,
  opened: PropTypes.bool,
  title: PropTypes.string,
}

AccordionItem.defaultProps = {
  className: '',
  opened: false,
}

const Accordion = ({ initialItem, ...restProps }) => {
  const classes = styles('accordion', {
    selectors: [
      restProps.className,
    ],
  })

  console.log(initialItem)

  const children = Children.map(restProps.children, (child, index) => {
    if (child !== null) {
      return cloneElement(child, {
        key: index,
        onClick: () => console.log(index),
      })
    }
  })

  return (
    <div className={classes}>
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
