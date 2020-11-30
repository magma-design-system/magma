import faker from 'faker'
import mggIconsDictionary from '+Project/mgg-icons/src/mgg-icons.json'

const randomIcon = () => {
  const iconNames = Object.keys(mggIconsDictionary)
  return faker.random.arrayElement(iconNames)
}

export default randomIcon
