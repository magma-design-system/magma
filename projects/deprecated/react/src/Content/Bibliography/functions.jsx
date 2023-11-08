const getMonthName = index => {
  const names = [
    'Gennaio',
    'Febbraio',
    'Marzo',
    'Aprile',
    'Maggio',
    'Giugno',
    'Luglio',
    'Agosto',
    'Settembre',
    'Ottobre',
    'Novembre',
    'Dicembre',
  ]

  return names[index]
}

const getDateAPA = date => {
  const dateData = new Date(date)
  return `(${dateData.getFullYear()}${dateData.getMonth() ? `, ${getMonthName(dateData.getMonth())}` : ''}${dateData.getDate() ? ` ${dateData.getDate()}` : ''}).`
}

const getDateMLA = date => {
  const dateData = new Date(date)
  return `${dateData.getDate() ? ` ${dateData.getDate()}` : ''} ${getMonthName(dateData.getMonth())} ${dateData.getFullYear()}.`
}

const getName = name => {
  return {
    firstName: name.split(' ')[0],
    lastName: name.split(' ')[name.split(' ').length - 1],
  }
}

const getNameAPA = name => {
  const { firstName, lastName } = getName(name)
  return ` ${lastName}${firstName ? ', ' + firstName.substring(0, firstName.length - firstName.length + 1) + '.' : ''}`
}

const getNameMLA = name => {
  const { firstName, lastName } = getName(name)
  return `${lastName}${firstName ? ', ' + firstName + ':' : ''}`
}

const getFormattedNameAPA = name => {
  if (!name) {
    return null
  }

  if (Array.isArray(name)) {
    const formattedNames = []
    name.forEach(nameItem => {
      formattedNames.push(getNameAPA(nameItem))
    })
    return formattedNames.toString()
  }

  return getNameAPA(name)
}

const getFormattedNameMLA = name => {
  if (!name) {
    return null
  }

  if (Array.isArray(name)) {
    const formattedNames = []
    name.forEach((nameItem, index) => {
      const { firstName, lastName } = getName(nameItem)
      if (index + 1 === name.length) {
        formattedNames.push(` ${firstName} ${lastName}:`)
      } else {
        formattedNames.push(` ${firstName} ${lastName}`)
      }
    })
    return formattedNames.toString()
  }

  return getNameMLA(name)
}

const getFullName = name => {
  if (!name) {
    return null
  }

  if (Array.isArray(name)) {
    const names = []
    name.forEach((nameItem, index) => {
      const { firstName, lastName } = getName(nameItem)
      const spacer = index !== 0 ? ' ' : ''
      names.push(`${spacer}${firstName} ${lastName}`)
    })
    return names.toString()
  }

  const { firstName, lastName } = getName(name)
  return `${firstName} ${lastName}`
}

export {
  getDateAPA,
  getDateMLA,
  getFormattedNameAPA,
  getFormattedNameMLA,
  getFullName,
}
