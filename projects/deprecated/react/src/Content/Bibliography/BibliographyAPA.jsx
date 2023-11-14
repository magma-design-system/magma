import React from 'react'
import PropTypes from 'prop-types'
import './Bibliography.scss'
import ExternalLink from '@UI/ExternalLink/ExternalLink'

import { getDateAPA, getFormattedNameAPA, getFullName } from '@Content/Bibliography/functions'

const BibliographyAPA = props => {
  const date = getDateAPA(props.date)
  const formattedName = getFormattedNameAPA(props.fullName)
  const fullName = getFullName(props.fullName)

  return <div className={`bibliography ${props.className} ${props.font}`}>
    <span className="bibliography__item bibliography__item--full-name" title={fullName}>{ formattedName }</span>
    {props.date && <time className="bibliography__item bibliography__item--date" dateTime={props.date}>{ date }</time>}
    {props.title && <span className="bibliography__item bibliography__item--title">Tratto da <b><ExternalLink href={props.url}>{props.title}</ExternalLink></b>.</span>}
    {!props.title && <span className="bibliography__item bibliography__item--title">Tratto da <b><ExternalLink href={props.url}>{props.url}</ExternalLink></b>.</span>}
    {props.site && <i className="bibliography__item bibliography__item--site">{props.site}</i>}
  </div>
}

BibliographyAPA.propTypes = {
  className: PropTypes.string,
  date: PropTypes.string,
  font: PropTypes.string,
  format: PropTypes.string,
  fullName: PropTypes.any,
  site: PropTypes.string,
  title: PropTypes.string,
  url: PropTypes.string,

}

BibliographyAPA.defaultProps = {
  className: '',
  font: 'text-secondary text-secondary--paragraph',
}

export default BibliographyAPA
