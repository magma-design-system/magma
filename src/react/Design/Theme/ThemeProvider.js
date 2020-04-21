import React, { useState } from 'react'
import PropTypes from 'prop-types'

const ThemeContext = React.createContext({

  theme: {
    light: {
      type: 'light',
      color: 'grey',
    },
    dark: {
      type: 'dark',
      color: 'black',
    },
  },

  setTheme: () => {},
})

const ThemeProvider = props => {
  const theme = {
    light: {
      type: 'light',
      primary: 'blue',
      text: 'white',
    },
    dark: {
      type: 'dark',
      primary: 'black',
      text: 'white',
    },
  }

  const setTheme = type => {
    setState({ ...state, theme: type === 'dark' ? theme.light : theme.dark })
  }

  const initState = {
    name: props.name,
    theme: props.theme,
    setTheme,
  }

  const [state, setState] = useState(initState)

  return (
    <ThemeContext.Provider value={state}>
      {props.children}
    </ThemeContext.Provider>
  )
}

ThemeProvider.propTypes = {
  name: PropTypes.string,
  theme: PropTypes.object,
}

ThemeProvider.defaultProps = {
  name: 'default',
  theme: {},
}

export default ThemeProvider

export {
  ThemeContext,
}
