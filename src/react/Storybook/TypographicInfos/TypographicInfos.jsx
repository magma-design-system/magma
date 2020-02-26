import React from 'react'
import PropTypes from 'prop-types'
import './TypographicInfos.scss'

import media from '../../../design-tokens/media.json'

import TypographicInfosViewport from './TypographicInfosViewport'

const clean = str => {
  return str.replace(/'/g, '')
}

const TypographicInfos = props =>
  <div className="typographic-infos">
    <header className="typographic-infos__header">
      {props.children}
    </header>
    <div className="typographic-infos__details">
      <hr/>
      <code className="typographic-infos__family">
        font-family: {clean(props.family)}
      </code>

      <div className="grid typographic-infos__rules">
        <TypographicInfosViewport
          viewportName='default'
          properties={props.properties.default}
        />
        {Object.keys(media).map((key, index) =>
          <TypographicInfosViewport
            key={index}
            viewportRule={media[key]}
            viewportName={key}
            properties={props.properties[key] || null}
          />
        )}
      </div>
    </div>
  </div>

TypographicInfos.propTypes = {
  family: PropTypes.string,
  styles: PropTypes.string,
  properties: PropTypes.obj,
}

export default TypographicInfos
