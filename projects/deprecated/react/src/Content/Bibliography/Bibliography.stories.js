import React, { Fragment } from 'react'
import faker from 'faker'

import BibliographyAPA from '@Content/Bibliography/BibliographyAPA'
import BibliographyMLA from '@Content/Bibliography/BibliographyMLA'

faker.locale = 'it'

export default {
  title: 'Content/Bibliography',
  component: BibliographyAPA,
}

export const formatAPA = () =>
  <BibliographyAPA fullName="Giorgio Moroder" date="2020-08-24" title="My name is Giovanni Giorgio, but everybody calls me Giorgio" site="Daft Punk - Random Access Memories" url="https://www.daftpunk.com/collections/shop-by-product/products/beach-towel"/>

export const multipleAuthorsAPA = () =>
  <BibliographyAPA fullName={['Daft Punk', 'Giorgio Moroder']} date="2020-08-24" title="My name is Giovanni Giorgio, but everybody calls me Giorgio" site="Daft Punk - Random Access Memories" url="https://www.daftpunk.com/collections/shop-by-product/products/beach-towel"/>

export const formatMLA = () =>
  <BibliographyMLA fullName="Giorgio Moroder" date="2020-08-24" title="My name is Giovanni Giorgio, but everybody calls me Giorgio" site="Daft Punk - Random Access Memories" url="https://www.daftpunk.com/collections/shop-by-product/products/beach-towel"/>

export const multipleAuthorsMLA = () =>
  <BibliographyMLA fullName={['Daft Punk', 'Giorgio Moroder']} date="2020-08-24" title="My name is Giovanni Giorgio, but everybody calls me Giorgio" site="Daft Punk - Random Access Memories" url="https://www.daftpunk.com/collections/shop-by-product/products/beach-towel"/>

export const customFont = () =>
  <Fragment>
    <BibliographyAPA font="text-secondary text-secondary--detail" fullName="Giorgio Moroder" date="2020-08-24" title="My name is Giovanni Giorgio, but everybody calls me Giorgio" site="Daft Punk - Random Access Memories" url="https://www.daftpunk.com/collections/shop-by-product/products/beach-towel"/>
    <BibliographyMLA font="text-secondary text-secondary--detail" fullName="Giorgio Moroder" date="2020-08-24" title="My name is Giovanni Giorgio, but everybody calls me Giorgio" site="Daft Punk - Random Access Memories" url="https://www.daftpunk.com/collections/shop-by-product/products/beach-towel"/>
  </Fragment>
