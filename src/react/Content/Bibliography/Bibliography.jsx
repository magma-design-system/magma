// APA: https://www.sciencebuddies.org/science-fair-projects/science-fair/writing-a-bibliography-apa-format
// MLA: https://www.sciencebuddies.org/science-fair-projects/science-fair/writing-a-bibliography-mla-format

import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import './Bibliography.scss'
import Link from '@UI/Link/Link'

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
  const fullName = `${props.firstName ? props.firstName : ''}${props.lastName ? ' ' + props.lastName : ''}`
  let fullFormattedName = `${props.lastName ? props.lastName : ''}${props.firstName ? ', ' + props.firstName.substring(0, props.firstName.length - props.firstName.length + 1) + '.' : ''}`

  let date = ''
  if (props.date) {
    const dateData = new Date(props.date)
    date = `(${dateData.getFullYear()}${dateData.getMonth() ? `, ${getMonthName(dateData.getMonth())}` : ''}${dateData.getDate() ? ` ${dateData.getDate()}` : ''}).`
  }

  if (props.format === 'mla') {
    fullFormattedName = `${props.lastName ? props.lastName : ''}${props.firstName ? ', ' + props.firstName + ':' : ''}`

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
          {props.title && <span className="bibliography__item bibliography__item--title">Tratto da <Link href={props.url}>{props.title}</Link>.</span>}
          {!props.title && <span className="bibliography__item bibliography__item--title">Tratto da <Link href={props.url}>{props.url}</Link>.</span>}
          {props.site && <i className="bibliography__item bibliography__item--site">{props.site}</i>}
        </Fragment>
        : <Fragment>
          <span className="bibliography__item bibliography__item--full-name" title={fullName}>{ fullFormattedName }</span>
          {props.title && <span className="bibliography__item bibliography__item--title">Tratto da <Link href={props.url}>{props.title}</Link>.</span>}
          {!props.title && <span className="bibliography__item bibliography__item--title">Tratto da <Link href={props.url}>{props.url}</Link>.</span>}
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
  font: PropTypes.string,
  firstName: PropTypes.string,
  format: PropTypes.string,
  lastName: PropTypes.string,
  site: PropTypes.string,
  title: PropTypes.string,
  url: PropTypes.string,

}

Bibliography.defaultProps = {
  className: '',
  font: 'text-secondary text-secondary--paragraph',
  format: 'apa',
}

export default Bibliography
