import React from 'react'
import PropTypes from 'prop-types'

import Icon from '../../Icon/Icon'
import './TypographicInfosViewport.scss'

const sort = unorderedData => {
  const orderedData = {}
  Object.keys(unorderedData).sort().forEach(key => {
    orderedData[key] = unorderedData[key]
  })
  return orderedData
}

const TypographicInfosViewport = props =>
  <div className={`typographic-infos-viewport typographic-infos-viewport--${props.viewportName}`}>
    <header className="typographic-infos-viewport__header">
      <b className="typographic-infos-viewport__name">{props.viewportName}</b>
      <Icon className="typographic-infos-viewport__icon color-green-3" name="dot"/>
    </header>
    {props.viewportRule
      ? <div>Rule: <code>{props.viewportRule}</code></div>
      : <div>Applies to all viewports</div>
    }
    {props.properties
      ? <code className="typographic-infos-viewport__props">
        {Object.keys(sort(props.properties)).map((key, index) =>
          <span className="typographic-infos-viewport__prop">
            {key}: {props.properties[key]}
          </span>
        )}
      </code>
      : <code className="typographic-infos-viewport__props">
        No properties for this viewport
      </code>
    }
  </div>

TypographicInfosViewport.propTypes = {
  family: PropTypes.string,
  name: PropTypes.string,
  properties: PropTypes.oneOfType([null, PropTypes.obj]),
  viewportRule: PropTypes.string,
  viewportName: PropTypes.string,
}

export default TypographicInfosViewport
