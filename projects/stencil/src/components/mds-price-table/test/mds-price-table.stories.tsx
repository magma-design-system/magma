import { h } from '@stencil/core'

export default {
  title: 'UI / Price table',
}

const Template = args =>
  <div class="grid gap-6">
    <mds-text typography="h1" class="desktop:hidden">Choose the plan for you</mds-text>
    <div class="grid tablet:grid-cols-2 mobile:grid-cols-1 gap-6">
      <mds-price-table {...args} class="desktop:hidden">
        <mds-price-table-list>
          <mds-text typography="h5" slot="header">Basic plan</mds-text>
          <mds-text typography="detail" slot="header">Piano adatto a liberi professionisti con studi di piccole dimensioni.</mds-text>
          <mds-text typography="h2" slot="price">49€</mds-text>
          <mds-button slot="action" variant="dark">Inizia</mds-button>
        </mds-price-table-list>
        <mds-price-table-features>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Base features</mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Users</mds-price-table-features-cell>
            <mds-price-table-features-cell type="text">10</mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">User data</mds-price-table-features-cell>
            <mds-price-table-features-cell type="text">10GB</mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Customer support</mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Automated functionalities</mds-price-table-features-cell>
            <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Analytics</mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Export reports</mds-price-table-features-cell>
            <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Reports snapshots</mds-price-table-features-cell>
            <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Advanced reports</mds-price-table-features-cell>
            <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
        </mds-price-table-features>
      </mds-price-table>
      <mds-price-table {...args} class="desktop:hidden">
        <mds-price-table-list class="bg-label-amaranth-10">
          <mds-text typography="h5" slot="header">Professional plan</mds-text>
          <mds-text typography="detail" slot="header">Piano adatto a liberi professionisti con studi di piccole dimensioni.</mds-text>
          <mds-text typography="h2" slot="price">99€</mds-text>
          <mds-button slot="action" variant="dark">Inizia</mds-button>
        </mds-price-table-list>
        <mds-price-table-features>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Base features</mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Users</mds-price-table-features-cell>
            <mds-price-table-features-cell type="text">20</mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">User data</mds-price-table-features-cell>
            <mds-price-table-features-cell type="text">20GB</mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Customer support</mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Automated functionalities</mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Analytics</mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Export reports</mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Reports snapshots</mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Advanced reports</mds-price-table-features-cell>
            <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
        </mds-price-table-features>
      </mds-price-table>
      <mds-price-table {...args} class="desktop:hidden">
        <mds-price-table-list class="bg-label-violet-10">
          <mds-text typography="h5" slot="header">Enterprise plan</mds-text>
          <mds-text typography="detail" slot="header">Piano adatto a liberi professionisti con studi di piccole dimensioni.</mds-text>
          <mds-text typography="h2" slot="price">149€</mds-text>
          <mds-button slot="action" variant="dark">Inizia</mds-button>
        </mds-price-table-list>
        <mds-price-table-features>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Base features</mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Users</mds-price-table-features-cell>
            <mds-price-table-features-cell type="text">Unlimited</mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">User data</mds-price-table-features-cell>
            <mds-price-table-features-cell type="text">1TB</mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Customer support</mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Automated functionalities</mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Analytics</mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Export reports</mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Reports snapshots</mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
          <mds-price-table-features-row>
            <mds-price-table-features-cell type="label">Advanced reports</mds-price-table-features-cell>
            <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          </mds-price-table-features-row>
        </mds-price-table-features>
      </mds-price-table>
    </div>
    <mds-price-table {...args} class="tablet-max:hidden">
      <mds-price-table-header {...args} class="mobile:grid-cols-1 tablet:grid-cols-3 desktop:grid-cols-4">
        <mds-text typography="h1" class="tablet:col-span-3 col-span-1 desktop:col-span-1 desktop:py-6">Choose the plan for you</mds-text>
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
      <mds-price-table-features {...args}>
        <mds-price-table-features-row>
          <mds-price-table-features-cell type="label">
            Base features
            <mds-help>The base features are: Login, Logout and Register.</mds-help>
          </mds-price-table-features-cell>
          <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        </mds-price-table-features-row>
        <mds-price-table-features-row>
          <mds-price-table-features-cell type="label">Users</mds-price-table-features-cell>
          <mds-price-table-features-cell type="text">10</mds-price-table-features-cell>
          <mds-price-table-features-cell type="text">20</mds-price-table-features-cell>
          <mds-price-table-features-cell type="text">
            Unlimited
            <mds-help>Aw, c'mon... You know it's impossible.</mds-help>
          </mds-price-table-features-cell>
        </mds-price-table-features-row>
        <mds-price-table-features-row>
          <mds-price-table-features-cell type="label">User data</mds-price-table-features-cell>
          <mds-price-table-features-cell type="text">10GB</mds-price-table-features-cell>
          <mds-price-table-features-cell type="text">20GB</mds-price-table-features-cell>
          <mds-price-table-features-cell type="text">1TB</mds-price-table-features-cell>
        </mds-price-table-features-row>
        <mds-price-table-features-row>
          <mds-price-table-features-cell type="label">Customer support</mds-price-table-features-cell>
          <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        </mds-price-table-features-row>
        <mds-price-table-features-row>
          <mds-price-table-features-cell type="label">Automated functionalities</mds-price-table-features-cell>
          <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
          <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        </mds-price-table-features-row>
        <mds-price-table-features-row>
          <mds-price-table-features-cell type="label">Analytics</mds-price-table-features-cell>
          <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        </mds-price-table-features-row>
        <mds-price-table-features-row>
          <mds-price-table-features-cell type="label">Export reports</mds-price-table-features-cell>
          <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
          <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        </mds-price-table-features-row>
        <mds-price-table-features-row>
          <mds-price-table-features-cell type="label">Reports snapshots</mds-price-table-features-cell>
          <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
          <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
          <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        </mds-price-table-features-row>
        <mds-price-table-features-row>
          <mds-price-table-features-cell type="label">Advanced reports</mds-price-table-features-cell>
          <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
          <mds-price-table-features-cell type="unsupported"></mds-price-table-features-cell>
          <mds-price-table-features-cell type="supported"></mds-price-table-features-cell>
        </mds-price-table-features-row>
      </mds-price-table-features>
    </mds-price-table>
  </div>

export const Default = Template.bind({})
Default.args = {
  label: 'Report e analisi',
}
