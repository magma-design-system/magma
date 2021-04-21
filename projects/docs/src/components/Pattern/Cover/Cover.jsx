import React from 'react'
import Video from '@Content/Video/Video'
import './Cover.scss'

const Cover = ({ children }) =>
  <div className="Cover w-full">
    <Video className="-ml-10 -mr-10" autoPlay loop>
      {children}
    </Video>
  </div>

export default Cover
