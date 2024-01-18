import { h } from '@stencil/core'

export default {
  title: 'UI / Price table / Price table header',
}

const Template = args =>
  <mds-price-table-header {...args} class="mobile:grid-cols-1 tablet:grid-cols-3 desktop:grid-cols-4">
    <mds-text typography="h1" class="tablet:col-span-3 col-span-1 desktop:col-span-1 desktop:py-600">Choose the plan for you</mds-text>
    <mds-price-table-list>
      <mds-text typography="h5" slot="header">Basic plan</mds-text>
      <mds-text typography="detail" slot="header">Piano adatto a liberi professionisti con studi di piccole dimensioni.</mds-text>
      <mds-text typography="h2" slot="price">49€</mds-text>
      <mds-button slot="action" variant="dark">Inizia</mds-button>
    </mds-price-table-list>
    <mds-price-table-list class="bg-label-amaranth-10">
      <mds-text typography="h5" slot="header">Professional plan</mds-text>
      <mds-text typography="detail" slot="header">Piano adatto a liberi professionisti con studi di piccole dimensioni.</mds-text>
      <mds-text typography="h2" slot="price">99€</mds-text>
      <mds-button slot="action" variant="dark">Inizia</mds-button>
    </mds-price-table-list>
    <mds-price-table-list class="bg-label-violet-10">
      <mds-text typography="h5" slot="header">Enterprise plan</mds-text>
      <mds-text typography="detail" slot="header">Piano adatto a liberi professionisti con studi di piccole dimensioni.</mds-text>
      <mds-text typography="h2" slot="price">149€</mds-text>
      <mds-button slot="action" variant="dark">Inizia</mds-button>
    </mds-price-table-list>
  </mds-price-table-header>

export const Default = Template.bind({})

