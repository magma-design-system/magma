const sortKeys = object => {
  if (typeof object !== 'object' || object instanceof Array) {
    return object
  }
  const keys = Object.keys(object)
  keys.sort()
  const newObject = {}
  for (let i = 0; i < keys.length; i++) {
    newObject[keys[i]] = sortKeys(object[keys[i]])
  }
  return newObject
}

exports.sortKeys = sortKeys
