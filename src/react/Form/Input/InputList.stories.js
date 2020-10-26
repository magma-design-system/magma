import React from 'react'
import faker from 'faker'

import InputList, { InputListItem } from '@Form/Input/InputList'
faker.locale = 'it'

export default {
  title: 'Form/List',
  component: InputList,
}

const cities = new Array(50)
  .fill(null)
  .map(() =>
    faker.address.city(),
  ).sort()

export const basicUsage = () =>
  <InputList label="Città" placeholder="Inerisci il nome di una città...">
    {cities.map((city, index) =>
      <InputListItem value={city}/>,
    )}
  </InputList>
