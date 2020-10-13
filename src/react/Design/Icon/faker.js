import faker from 'faker'
import mggIconsDictionary from '£Project/mgg-icons/src/mgg-icons.json'

const randomIcon = () => {
  const icons = Object.entries(mggIconsDictionary)
  return icons[faker.random.number(icons.length - 1)][0]
}

export default randomIcon
