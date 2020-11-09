import React from 'react'
import PropTypes from 'prop-types'
import './Bibliography.scss'
import ExternalLink from '@UI/ExternalLink/ExternalLink'

import { getDateMLA, getFormattedNameMLA, getFullName } from '@Content/Bibliography/functions'

const BibliographyMLA = props => {
  const date = getDateMLA(props.date)
  const formattedName = getFormattedNameMLA(props.fullName)
  const fullName = getFullName(props.fullName)

  return <div className={`bibliography ${props.className} ${props.font}`}>
    {formattedName && <span className="bibliography__item bibliography__item--full-name" title={fullName}>{ formattedName }</span>}
    {props.title && <span className="bibliography__item bibliography__item--title">Tratto da <ExternalLink href={props.url}>{props.title}</ExternalLink>.</span>}
    {!props.title && <span className="bibliography__item bibliography__item--title">Tratto da <ExternalLink href={props.url}>{props.url}</ExternalLink>.</span>}
    {props.site && <i className="bibliography__item bibliography__item--site">{props.site}.</i>}
    {props.date && <time className="bibliography__item bibliography__item--date" dateTime={props.date}>{ date }</time>}
  </div>
}

BibliographyMLA.propTypes = {
  className: PropTypes.string,
  date: PropTypes.string,
  font: PropTypes.string,
  format: PropTypes.string,
  fullName: PropTypes.any,
  site: PropTypes.string,
  title: PropTypes.string,
  url: PropTypes.string,

}

BibliographyMLA.defaultProps = {
  className: '',
  font: 'text-secondary text-secondary--paragraph',
}

export default BibliographyMLA
