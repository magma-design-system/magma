import React from 'react'
import faker from 'faker'

import Bibliography from '@Content/Bibliography/Bibliography'

faker.locale = 'it'

export default {
  title: 'Content/Bibliography',
  component: Bibliography,
}

export const formatAPA = () =>
  <Bibliography firstName="Giorgio" lastName="Moroder" date="2020-08-24" title="My name is Giovanni Giorgio, but everybody calls me Giorgio" site="Daft Punk - Random Access Memories" url="https://www.daftpunk.com/collections/shop-by-product/products/beach-towel"/>

export const formatMLA = () =>
  <Bibliography format="mla" firstName="Giorgio" lastName="Moroder" date="2020-08-24" title="My name is Giovanni Giorgio, but everybody calls me Giorgio" site="Daft Punk - Random Access Memories" url="https://www.daftpunk.com/collections/shop-by-product/products/beach-towel"/>

export const formatMLAMinimal = () =>
  <Bibliography format="mla" title="My name is Giovanni Giorgio, but everybody calls me Giorgio" site="Daft Punk - Random Access Memories" url="https://www.daftpunk.com/collections/shop-by-product/products/beach-towel"/>

export const font = () =>
  <Bibliography font="text-secondary text-secondary--detail" format="mla" title="My name is Giovanni Giorgio, but everybody calls me Giorgio" site="Daft Punk - Random Access Memories" url="https://www.daftpunk.com/collections/shop-by-product/products/beach-towel"/>
