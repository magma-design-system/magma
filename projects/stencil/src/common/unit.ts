const cssDurationToMilliseconds = (duration: string, defaultValue = 1000): number => {
  if (duration.includes('s')) {
    return parseInt(duration.replace('s', '')) * 1000
  }

  if (duration.includes('ms')) {
    return parseInt(duration.replace('s', ''))
  }

  return defaultValue
}
export {
  cssDurationToMilliseconds,
}
