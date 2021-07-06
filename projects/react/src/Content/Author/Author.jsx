import React from 'react'
import PropTypes from 'prop-types'

import Avatar from '@Content/Avatar/Avatar'
import Row from '@Layout/Row/Row'

const Author = props =>
  <Row className={`author ${props.className}`} {...props}>
    <Avatar className="author__avatar" src={props.avatar} {...props}/>
    <div className="author__infos text-white">
      {props.children}
    </div>
  </Row>

Author.propTypes = {
  avatar: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.string
}

Author.defaultProps = {
  className: '',
  size: 'normal',
}

export default Author
