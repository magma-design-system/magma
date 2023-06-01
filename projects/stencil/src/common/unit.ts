const cssDurationToMilliseconds = (duration: string, defaultValue = 1000): number => {
  if (duration.includes('s')) {
    return Number(duration.replace('s', '')) * 1000
  }

  if (duration.includes('ms')) {
    return Number(duration.replace('s', ''))
  }

  return defaultValue
}
export {
  cssDurationToMilliseconds,
}
