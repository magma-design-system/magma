const cssDurationToMilliseconds = (duration: string, defaultValue = 1000): number => {

  if (duration.includes('ms')) {
    return Number(duration.replace('ms', ''))
  }

  if (duration.includes('s')) {
    return Number(duration.replace('s', '')) * 1000
  }

  return defaultValue
}

const cssSizeToNumber = (size: string, defaultValue = 0): number => {
  if (size.includes('px')) {
    return Number(size.replace('px', ''))
  }

  if (size.includes('rem')) {
    return Number(size.replace('rem', '')) * 16
  }

  if (size.includes('em')) {
    return Number(size.replace('em', '')) * 16
  }

  return defaultValue
}

export {
  cssDurationToMilliseconds,
  cssSizeToNumber,
}
