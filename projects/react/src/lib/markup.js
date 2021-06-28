export const toId = value => {
  return value.toString().replace(/(\W{1,})/gm, '-').replace(/(-)$/gm, '').toLowerCase()
}
