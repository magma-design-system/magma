import React from 'react'
import PropTypes from 'prop-types'
import { styles } from '@Library/styles'
import './Video.scss'

const Video = ({ className, children, overlay, overlayClassName, unsupported, ...restProps }) => {
  const classes = styles('Video', {
    selectors: [
      'relative',
      className,
    ],
  })

  const classesOverlay = styles('Video__overlay', {
    selectors: [
      'absolute',
      'h-full',
      'pointer-events-none',
      'w-full',
      overlayClassName,
    ],
    modifiers: [
      overlay,
    ],
  })

  return <div className={classes}>
    {overlay && <div className={classesOverlay}></div> }
    <video className="w-full h-full" {...restProps}>
      {children}
      {unsupported}
    </video>
  </div>
}

Video.propTypes = {
  className: PropTypes.string,
  overlay: PropTypes.string,
  overlayClassName: PropTypes.string,
  unsupported: PropTypes.string,
}

Video.defaultProps = {
  unsupported: 'Pare che il tuo browser non supporti i video embeddati.',
}

export default Video
