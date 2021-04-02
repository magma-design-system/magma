import faker from 'faker'
import mggIconsDictionary from '+Project/icons/resources/mgg-icons.json'

const randomIcon = () => {
  const iconNames = Object.keys(mggIconsDictionary)
  return faker.random.arrayElement(iconNames)
}

export default randomIcon
