import React, { useState } from 'react'

export const ThemeContext = React.createContext({

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

export const ThemeContextProvider = props => {
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
    theme: theme.dark,
    setTheme,
  }

  const [state, setState] = useState(initState)

  return (
    <ThemeContext.Provider value={state}>
      {props.children}
    </ThemeContext.Provider>
  )
}
