import { useState, useEffect } from 'react'

export function useOnClickOutside(initialIsVisible, ref) {
  const [isComponentVisible, setVisible] = useState(
    initialIsVisible,
  )

  const handleHideDropdown = event => {
    if (event.key === 'Escape') {
      setVisible(false)
    }
  }

  const handleClickOutside = event => {
    if (ref.current && !ref.current.contains(event.target)) {
      setVisible(false)
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleHideDropdown, true)
    document.addEventListener('click', handleClickOutside, true)
    return () => {
      document.removeEventListener('keydown', handleHideDropdown, true)
      document.removeEventListener('click', handleClickOutside, true)
    }
  })

  return { ref, isComponentVisible, setVisible }
}
