export const id = (id, value, length) => {
  if (id) {
    if (typeof id === 'boolean') {
      const maxLength = length ? length : 1000
      const fullId = value.replace(/(\W{1,})/gm, '-').replace(/(-)$/gm, '').toLowerCase()
      const shortId = fullId.split('-').slice(0, fullId.length >= maxLength ? maxLength : fullId.length)
      return shortId.join('-')
    }
    return id.replace(/(\W{1,})/gm, '-').replace(/(-)$/gm, '').toLowerCase()
  }
  return undefined
}
