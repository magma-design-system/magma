import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import Avatar from '@Content/Avatar/Avatar'
import Row from '@Layout/Row/Row'

const Author = ({ children, className, ...restProps }) =>
  <Row className={clsx('author', className)}>
    <Avatar className="author__avatar" {...restProps}/>
    <div className="author__infos text-white">
      { children }
    </div>
  </Row>

Author.propTypes = {
  ...Avatar.propTypes,
  className: PropTypes.string,
}

export default Author
