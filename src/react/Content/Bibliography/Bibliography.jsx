// APA: https://www.sciencebuddies.org/science-fair-projects/science-fair/writing-a-bibliography-apa-format
// MLA: https://www.sciencebuddies.org/science-fair-projects/science-fair/writing-a-bibliography-mla-format

import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import './Bibliography.scss'
import ExternalLink from '@UI/ExternalLink/ExternalLink'

function getMonthName(index) {
  const names = [
    'Gennaio',
    'Febbraio',
    'Marzo',
    'Aprile',
    'Maggio',
    'Giugno',
    'Luglio',
    'Agosto',
    'Settembre',
    'Ottobre',
    'Novembre',
    'Dicembre',
  ]

  return names[index]
}

const Bibliography = props => {
  let fullName = `${props.firstName ? props.firstName : ''}${props.lastName ? ' ' + props.lastName : ''}`
  let { firstName, lastName } = props

  if (props.fullName) {
    firstName = props.fullName.split(' ')[0]
    lastName = props.fullName.split(' ')[props.fullName.split(' ').length - 1]
    fullName = `${firstName} ${lastName}`
  }
  let fullFormattedName = `${lastName}${firstName ? ', ' + firstName.substring(0, firstName.length - firstName.length + 1) + '.' : ''}`

  let date = ''
  if (props.date) {
    const dateData = new Date(props.date)
    date = `(${dateData.getFullYear()}${dateData.getMonth() ? `, ${getMonthName(dateData.getMonth())}` : ''}${dateData.getDate() ? ` ${dateData.getDate()}` : ''}).`
  }

  if (props.format === 'mla') {
    fullFormattedName = `${lastName}${firstName ? ', ' + firstName + ':' : ''}`

    if (props.date) {
      const dateData = new Date(props.date)
      date = `${dateData.getDate() ? ` ${dateData.getDate()}` : ''} ${getMonthName(dateData.getMonth())} ${dateData.getFullYear()}.`
    }
  }

  return (
    <div className={`bibliography ${props.className} ${props.font}`}>
      {props.format === 'apa'
        ? <Fragment>
          <span className="bibliography__item bibliography__item--full-name" title={fullName}>{ fullFormattedName }</span>
          <time className="bibliography__item bibliography__item--date" datetime={props.date}>{ date }</time>
          {props.title && <span className="bibliography__item bibliography__item--title">Tratto da <ExternalLink href={props.url}>{props.title}</ExternalLink>.</span>}
          {!props.title && <span className="bibliography__item bibliography__item--title">Tratto da <ExternalLink href={props.url}>{props.url}</ExternalLink>.</span>}
          {props.site && <i className="bibliography__item bibliography__item--site">{props.site}</i>}
        </Fragment>
        : <Fragment>
          <span className="bibliography__item bibliography__item--full-name" title={fullName}>{ fullFormattedName }</span>
          {props.title && <span className="bibliography__item bibliography__item--title">Tratto da <ExternalLink href={props.url}>{props.title}</ExternalLink>.</span>}
          {!props.title && <span className="bibliography__item bibliography__item--title">Tratto da <ExternalLink href={props.url}>{props.url}</ExternalLink>.</span>}
          {props.site && <i className="bibliography__item bibliography__item--site">{props.site}.</i>}
          <time className="bibliography__item bibliography__item--date" datetime={props.date}>{ date }</time>
        </Fragment>
      }
    </div>
  )
}

Bibliography.propTypes = {
  className: PropTypes.string,
  date: PropTypes.string,
  firstName: PropTypes.string,
  font: PropTypes.string,
  format: PropTypes.string,
  fullName: PropTypes.string,
  lastName: PropTypes.string,
  site: PropTypes.string,
  title: PropTypes.string,
  url: PropTypes.string,

}

Bibliography.defaultProps = {
  className: '',
  firstName: '',
  font: 'text-secondary text-secondary--paragraph',
  format: 'apa',
  fullName: '',
  lastName: '',
}

export default Bibliography
