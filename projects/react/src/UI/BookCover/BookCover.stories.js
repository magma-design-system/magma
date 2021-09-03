import React from 'react'
import faker from 'faker'

import BookCover from '@UI/BookCover/BookCover'

export default {
  title: 'UI/BookCover',
  component: BookCover,
}

export const basicUsage = () =>
  <BookCover className="w-40" src="https://www.maggiolieditore.it/media/catalog/product/cache/5/image/222x/040ec09b1e35df139433887a97daa66f/8/8/8891652263.jpg"/>
