import React from 'react'
import PropTypes from 'prop-types'
// import { CopyToClipboard } from 'react-copy-to-clipboard'
import { styles } from '@Library/styles'
import { id } from '@Library/markup'
import Row from '@Layout/Row/Row'
import Icon from '@Design/Icon/Icon'

const Typography = ({ anchor, children, classNameAnchor, className, htmlTag, ...restProps }) => {
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
  const Element = () => <HtmlTag id={id(restProps.id, children)} className={className} {...restProps}>
    { children }
  </HtmlTag>

  if (anchor) {
    return <Row className="items-start">
      <div className={classesAnchor}>
        <Icon name="action-link-on"/>
      </div>
      <Element/>
    </Row>
  }
  return <Element/>
}

Typography.propTypes = {
  anchor: PropTypes.bool,
  className: PropTypes.string,
  classNameAnchor: PropTypes.string,
  htmlTag: PropTypes.string,
  id: PropTypes.any,
}

Typography.defaultProps = {
  anchor: false,
  classNameAnchor: 'hover:bg-adjust-tone-18',
  className: '',
  htmlTag: 'span',
  id: false,
}

export default Typography
