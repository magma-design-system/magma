import React from 'react'
import PropTypes from 'prop-types'
// import { CopyToClipboard } from 'react-copy-to-clipboard'
import { styles } from '@Library/styles'
import { toId } from '@Library/markup'
import Row from '@Layout/Row/Row'
import Icon from '@Design/Icon/Icon'

const Typography = ({ autoId, anchor, beautifyId, children, classNameAnchor, className, htmlTag, id, ...restProps }) => {
  const classesAnchor = styles('anchor', {
    selectors: [
      className,
      classNameAnchor,
      'cursor-pointer',
      'flex-shrink-0',
      'px-2',
      'rounded',
      'transition-colors',
    ],
  })

  const HtmlTag = htmlTag.toLowerCase()

  let elementId = !id && autoId ? toId(children) : id
  elementId = beautifyId ? toId(elementId) : elementId

  if (anchor) {
    return <Row className="items-start">
      <div className={classesAnchor}>
        <Icon name="action-link-on"/>
      </div>
      <HtmlTag id={elementId} className={className} {...restProps}>
        { children }
      </HtmlTag>
    </Row>
  }
  return <HtmlTag id={elementId} className={className} {...restProps}>
    { children }
  </HtmlTag>
}

Typography.propTypes = {
  anchor: PropTypes.bool,
  autoId: PropTypes.bool,
  beautifyId: PropTypes.bool,
  className: PropTypes.string,
  classNameAnchor: PropTypes.string,
  htmlTag: PropTypes.string,
  id: PropTypes.string,
}

Typography.defaultProps = {
  anchor: false,
  autoId: false,
  beautifyId: false,
  classNameAnchor: 'hover:bg-adjust-tone-18',
  htmlTag: 'span',
}

export default Typography
