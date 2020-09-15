/*
author and editor names (if available)
title of the page (if available)
the company or organization who posted the webpage
the Web address for the page (called a URL)
the last date you looked at the page

MLA - Kanfer, Stefan. "Heard Any Good Books Lately?" Time 113 21 July 1986: 71-72.
APA - Kalette, D. (1986, July 21). California town counts town to big quake. USA Today, 9, p. A1.

*/

import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import './Bibliography.scss'

import Paragraph from '@Typography/Paragraph/Paragraph'
import Link from '@Element/Link/Link'

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
    fullFormattedName = `${props.lastName ? props.lastName : ''}${props.firstName ? ', ' + props.firstName + '.' : ''}`
  }

  return (
    <div className={`bibliography ${props.className}`}>
      {props.format === 'apa'
        ? <Paragraph>
          <span className="bibliography__item bibliography__item--full-name" title={fullName}>{ fullFormattedName }</span>
          <time className="bibliography__item bibliography__item--date" datetime={props.date}>{ date }</time>
          {props.url
            ? <Fragment>{props.title && <Link className="bibliography__item bibliography__item--title" href={props.url}>{props.title}</Link>}</Fragment>
            : <Fragment>{props.title && <span className="bibliography__item bibliography__item--title">{props.title}</span>}</Fragment>
          }

        </Paragraph>
        : <Paragraph></Paragraph>
      }
    </div>
  )
}

Bibliography.propTypes = {
  className: PropTypes.string,
  date: PropTypes.string,
  firstName: PropTypes.string,
  format: PropTypes.string,
  lastName: PropTypes.string,
  site: PropTypes.string,
  title: PropTypes.string,
  url: PropTypes.string,

}

Bibliography.defaultProps = {
  className: '',
  format: 'apa',
}

export default Bibliography
