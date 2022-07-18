import { h } from '@stencil/core'
import versions from './components-version.json'

export default {
  title: 'Components version',
}

const Template = () =>
  <div>
    Here will be displayed the published components available here in Storybook alongside their running version
    <div class='py-2 grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))]'>
      {
        Object.keys(versions).map((component, i) => <div key={i}>
          <mds-text typography='action'>{component}</mds-text>: v{versions[component]}
        </div>)
      }
    </div>
  </div>

export const Versions = Template.bind({})
