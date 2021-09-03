import React from 'react'
import Image from '@Content/Image/Image'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import './BookCover.scss'

const BookCover = ({ className, src, ...restProps }) => {
  const classes = styles('book-cover', {
    selectors: [
      className,
    ],
  })

  return (
    <div className={classes} {...restProps}>
      <Image className="book-cover__image" src={src}/>
      <div className="book-cover__decoration" />
    </div>
  )
}

BookCover.propTypes = {
  className: PropTypes.string,
  src: PropTypes.bool,
}

BookCover.defaultProps = {
  src: 'https://via.placeholder.com/444x628',
}



export default BookCover
