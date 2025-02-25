import { h } from '@stencil/core'
import versions from './components-version.json'

export default {
  title: 'Common tests',
}

const Template = () =>
  <div class="grid gap-600">
    <mds-text typography='detail'>Here will be displayed the published components available here in Storybook alongside their running version</mds-text>
    <mds-table interactive>
      <mds-table-header>
        <mds-table-header-cell sortable label="Component name"></mds-table-header-cell>
        <mds-table-header-cell sortable label="Version"></mds-table-header-cell>
      </mds-table-header>
      <mds-table-body>
        {
          Object.keys(versions).map((component, i) => <mds-table-row key={i}>
            <mds-table-cell value={component}><mds-text typography="detail" truncate="word"><b>{component}</b></mds-text></mds-table-cell>
            <mds-table-cell value={versions[component]}><mds-text typography='hack'>v{versions[component]}</mds-text></mds-table-cell>
            <mds-button
              icon="mdi/npm"
              slot="action"
              title="Go to NPM module"
              tone="strong"
              variant="error"
              onClick={() => { window.open(`https://www.npmjs.com/package/@maggioli-design-system/${component}`, '_blank') }}
            ></mds-button>
          </mds-table-row>)
        }
      </mds-table-body>
    </mds-table>
  </div>

export const Versions = Template.bind({})
