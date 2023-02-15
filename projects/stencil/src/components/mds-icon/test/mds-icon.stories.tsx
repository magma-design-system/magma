import { h } from '@stencil/core'
import { iconsDictionary, mggIconsDictionary } from '@dictionary/icon'

export default {
  title: 'Design / Icon',
  argTypes: {
    name: {
      type: { name: 'string' },
      description: 'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: mggIconsDictionary.concat(iconsDictionary),
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-icon {...args} />

export const Default = Template.bind({})
Default.args = {
  name: 'mdi/alien',
  class: 'fill-label-blue-05',
}

export const ExternalSVG = Template.bind({})
ExternalSVG.args = {
  name: 'https://clayto.com/icons/font-awesome/solid/carrot.svg',
  class: 'fill-label-green-06',
}

export const NoIcon = Template.bind({})

const ButtonTemplate = args =>
  <div>
    <button onClick={() => {
      const pathName = window.location.pathname.replace('/iframe.html', '')
      const svgPath = pathName.charAt(pathName.length - 1) === '/' ? `${pathName}svg/` : `${pathName}/svg/`
      window.sessionStorage.setItem('mdsIconSvgPath', svgPath)
      window.dispatchEvent(new CustomEvent('mdsIconSvgPathUpdate'))
    }}>Cliccami</button><br />
    <mds-icon {...args}></mds-icon><br />
    <mds-icon {...args}></mds-icon><br />
    <mds-icon {...args}></mds-icon><br />
    <mds-icon {...args}></mds-icon><br />
    <mds-icon {...args}></mds-icon><br />
    <mds-icon {...args}></mds-icon><br />
    <mds-icon {...args}></mds-icon>
  </div>

export const StorageTest = ButtonTemplate.bind({})
StorageTest.args = {
  name: 'mdi/alien',
  class: 'fill-label-green-05',
}
