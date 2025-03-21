import { h } from '@stencil/core'
import { useState, FC } from 'react'

export default {
  title: 'Layout / Table',
  argTypes: {
    interactive: {
      type: { name: 'boolean' },
      description: 'Specifies if the table rows are higlighted on mouseover event',
    },
    selectable: {
      type: { name: 'boolean' },
      description: 'Specifies if the table rows are selectable by a checkbox',
    },
  },
}

const Template = args =>
  <mds-table {...args}>
    <mds-table-header>
      <mds-table-header-cell label="Username"></mds-table-header-cell>
      <mds-table-header-cell label="Email"></mds-table-header-cell>
      <mds-table-header-cell label="Date"></mds-table-header-cell>
    </mds-table-header>
    <mds-table-body>
      <mds-table-row>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">mario.rossi</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">mario.rossi@nintendo.com</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">12 ottobre 1985</mds-text></mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">luigi.verdi</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">luigi.verdi@nintendo.com</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">12 ottobre 1985</mds-text></mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">wario.gialli</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">wario.gialli@nintendo.com</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">3 marzo 1993</mds-text></mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">waluigi.violetti</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">waluigi.violetti@nintendo.com</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">8 giugno 1999</mds-text></mds-table-cell>
      </mds-table-row>
    </mds-table-body>
    <mds-table-footer>
      <mds-table-cell><mds-text typography="action">Username</mds-text></mds-table-cell>
      <mds-table-cell><mds-text typography="action">Email</mds-text></mds-table-cell>
      <mds-table-cell><mds-text typography="action">Date</mds-text></mds-table-cell>
    </mds-table-footer>
  </mds-table>

const TemplateSortable = args =>
  <mds-table {...args}>
    <mds-table-header>
      <mds-table-header-cell sortable label="Numbers"></mds-table-header-cell>
      <mds-table-header-cell sortable label="Strings"></mds-table-header-cell>
      <mds-table-header-cell sortable label="Strings from cell"></mds-table-header-cell>
      <mds-table-header-cell label="No sortable column"></mds-table-header-cell>
    </mds-table-header>
    <mds-table-body>
      <mds-table-row>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">3</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">01</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">Tower Plaza</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">+22 777 892301</mds-text></mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">1</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">05</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">22nd Evenue</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">+22 433 471047</mds-text></mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">2</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">11</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">ARK Plaza</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">+22 334 187366</mds-text></mds-table-cell>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">4</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">22</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">_Underscore Building</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">+22 333 997741</mds-text></mds-table-cell>
      </mds-table-row>
    </mds-table-body>
  </mds-table>

const TemplateSortableActions = args =>
  <mds-table {...args}>
    <mds-table-header>
      <mds-table-header-cell sortable label="Numbers"></mds-table-header-cell>
      <mds-table-header-cell sortable label="Strings"></mds-table-header-cell>
      <mds-table-header-cell sortable label="Strings from cell"></mds-table-header-cell>
      <mds-table-header-cell label="No sortable column"></mds-table-header-cell>
    </mds-table-header>
    <mds-table-body>
      <mds-table-row>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">3</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">01</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">Tower Plaza</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">+22 777 892301</mds-text></mds-table-cell>
        <mds-button slot="action" icon="mi/baseline/send" title="Write message" variant="dark" tone="weak"></mds-button>
        <mds-button slot="action" icon="mi/baseline/call" title="Call number" variant="dark" tone="weak"></mds-button>
        <mds-button slot="action" icon="mi/baseline/delete" title="Remove record" variant="error"></mds-button>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">1</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">05</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">22nd Evenue</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">+22 433 471047</mds-text></mds-table-cell>
        <mds-button slot="action" icon="mi/baseline/send" title="Write message" variant="dark" tone="weak"></mds-button>
        <mds-button slot="action" icon="mi/baseline/call" title="Call number" variant="dark" tone="weak"></mds-button>
        <mds-button slot="action" icon="mi/baseline/delete" title="Remove record" variant="error"></mds-button>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">2</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">11</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">ARK Plaza</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">+22 334 187366</mds-text></mds-table-cell>
        <mds-button slot="action" icon="mi/baseline/send" title="Write message" variant="dark" tone="weak"></mds-button>
        <mds-button slot="action" icon="mi/baseline/call" title="Call number" variant="dark" tone="weak"></mds-button>
        <mds-button slot="action" icon="mi/baseline/delete" title="Remove record" variant="error"></mds-button>
      </mds-table-row>
      <mds-table-row>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">4</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">22</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">_Underscore Building</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">+22 333 997741</mds-text></mds-table-cell>
        <mds-button slot="action" icon="mi/baseline/send" title="Write message" variant="dark" tone="weak"></mds-button>
        <mds-button slot="action" icon="mi/baseline/call" title="Call number" variant="dark" tone="weak"></mds-button>
        <mds-button slot="action" icon="mi/baseline/delete" title="Remove record" variant="error"></mds-button>
      </mds-table-row>
    </mds-table-body>
  </mds-table>

const TemplateSelectable = args =>
  <mds-table {...args}>
    <mds-table-header>
      <mds-table-header-cell sortable label="Numbers"></mds-table-header-cell>
      <mds-table-header-cell sortable label="Strings"></mds-table-header-cell>
      <mds-table-header-cell sortable label="Strings from cell"></mds-table-header-cell>
      <mds-table-header-cell label="No sortable column"></mds-table-header-cell>
    </mds-table-header>
    <mds-table-body>
      <mds-table-row value="first element">
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">3</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">01</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">Tower Plaza</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">+22 777 892301</mds-text></mds-table-cell>
        <mds-button slot="action" icon="mi/baseline/send" title="Write message" variant="dark" tone="weak"></mds-button>
        <mds-button slot="action" icon="mi/baseline/call" title="Call number" variant="dark" tone="weak"></mds-button>
        <mds-button slot="action" icon="mi/baseline/delete" title="Remove record" variant="error"></mds-button>
      </mds-table-row>
      <mds-table-row value="second element">
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">1</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">05</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">22nd Evenue</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">+22 433 471047</mds-text></mds-table-cell>
        <mds-button slot="action" icon="mi/baseline/send" title="Write message" variant="dark" tone="weak"></mds-button>
        <mds-button slot="action" icon="mi/baseline/call" title="Call number" variant="dark" tone="weak"></mds-button>
        <mds-button slot="action" icon="mi/baseline/delete" title="Remove record" variant="error"></mds-button>
      </mds-table-row>
      <mds-table-row value={33}>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">2</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">11</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">ARK Plaza</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">+22 334 187366</mds-text></mds-table-cell>
        <mds-button slot="action" icon="mi/baseline/send" title="Write message" variant="dark" tone="weak"></mds-button>
        <mds-button slot="action" icon="mi/baseline/call" title="Call number" variant="dark" tone="weak"></mds-button>
        <mds-button slot="action" icon="mi/baseline/delete" title="Remove record" variant="error"></mds-button>
      </mds-table-row>
      <mds-table-row value="forth element">
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">4</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">22</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">_Underscore Building</mds-text></mds-table-cell>
        <mds-table-cell class="min-w-5200"><mds-text typography="detail">+22 333 997741</mds-text></mds-table-cell>
        <mds-button slot="action" icon="mi/baseline/send" title="Write message" variant="dark" tone="weak"></mds-button>
        <mds-button slot="action" icon="mi/baseline/call" title="Call number" variant="dark" tone="weak"></mds-button>
        <mds-button slot="action" icon="mi/baseline/delete" title="Remove record" variant="error"></mds-button>
      </mds-table-row>
    </mds-table-body>
  </mds-table>

type AsyncSlottedRowProps = {
  key?: number
  name: string;
  email: string;
};
const AsyncSlottedRow: FC<AsyncSlottedRowProps> = ({ name, email }) => {
  return <mds-table-row>
    <mds-table-cell value={name} class="min-w-5200"><mds-text typography="detail">{name}</mds-text></mds-table-cell>
    <mds-table-cell value={email} class="min-w-5200"><mds-text typography="detail">{email}</mds-text></mds-table-cell>
    <mds-button slot="action" icon="mi/baseline/delete" title="Remove record" variant="error"></mds-button>
  </mds-table-row>
}

const TemplateAsyncSlottedContents = () => {

  const firstList = [
    { name: 'Mario Rossi', email: 'mario.rossi@nintendo.com' },
    { name: 'Luigi Verdi', email: 'luigi.verdi@nintendo.com' },
    { name: 'Wario Gialli', email: 'wario.gialli@nintendo.com' },
    { name: 'Waluigi Violetti', email: 'waluigi.violetti@nintendo.com' },
  ]
  const secondList = [
    { name: 'Devastatore Decepticoni', email: 'devastatore.decepticoni@hasbro.com' },
    { name: 'Galvatrone Megatroni', email: 'galvatrone.megatroni@hasbro.com' },
    { name: 'Ottimo Primo', email: 'ottimo.primo@hasbro.com' },
    { name: 'Strillo Stella', email: 'strillo.stella@hasbro.com' },
  ]

  const [dataList, setData] = useState(firstList)

  function updateData () {
    if (dataList.length > 4) {
      setData(firstList)
      return
    }
    setData(firstList.concat(secondList))
  }

  return <div class="grid grid-cols-1 gap-600">
    <div class="inline-flex">
      <mds-button
        icon={dataList.length > 4 ? 'mi/baseline/check' : 'mi/baseline/add'}
        variant={dataList.length > 4 ? 'success' : 'primary'}
        // disabled={dataList.length > 4}
        onClick={() => updateData()}>
        {dataList.length > 4 ? 'Users added, click again to reset' : 'Add users'}
      </mds-button>
    </div>
    <mds-table selectable>
      <mds-table-header>
        <mds-table-header-cell sortable label="Full Name"></mds-table-header-cell>
        <mds-table-header-cell sortable label="Email"></mds-table-header-cell>
      </mds-table-header>
      <mds-table-body>
        {dataList.map((user, index) => <AsyncSlottedRow key={index} name={user.name} email={user.email} />)}
      </mds-table-body>
    </mds-table>
  </div>
}


export const Default = Template.bind({})

export const Interactive = Template.bind({})
Interactive.args = {
  interactive: true,
}

export const Sortable = TemplateSortable.bind({})
Sortable.args = {
  interactive: true,
}

export const Actions = TemplateSortableActions.bind({})
Actions.args = {
  interactive: true,
}

export const Selectable = TemplateSelectable.bind({})
Selectable.args = {
  interactive: false,
  selectable: true,
}

export const AsyncSlottedContents = TemplateAsyncSlottedContents.bind({})
AsyncSlottedContents.args = {
  interactive: false,
  selectable: true,
}
