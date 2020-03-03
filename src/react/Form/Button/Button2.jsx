import React, {useContext} from 'react'
import {ThemeContext} from '../../Theme/ThemeProvider'

export default function Button2() {

  const state = useContext(ThemeContext)

  const button = {
    backgroundColor: state.theme.primary,
    color: state.theme.text
  }

  return(
    <button style={button}>
      Tema
    </button>
  )
}
