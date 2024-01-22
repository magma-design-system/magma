import { h } from '@stencil/core'
import { iconsDictionary, mggIconsDictionary } from '@dictionary/icon'

const urlIcon = `${location.origin}/svg/mi/baseline/email.svg`
const base64IconEncoded = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgLTk2MCA5NjAgOTYwIiB3aWR0aD0iMjQiPjxwYXRoIGQ9Im0yMzMtODAgNjUtMjgxTDgwLTU1MGwyODgtMjUgMTEyLTI2NSAxMTIgMjY1IDI4OCAyNS0yMTggMTg5IDY1IDI4MS0yNDctMTQ5TDIzMy04MFoiLz48L3N2Zz4='
const svgIconDecoded = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6s-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8s-3.58-8-8-8z"/></svg>'

export default {
  title: 'Design / Icon',
  argTypes: {
    name: {
      type: { name: 'string' },
      description: 'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: mggIconsDictionary.concat(iconsDictionary).concat([base64IconEncoded, svgIconDecoded, urlIcon]),
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

export const NameBase64 = Template.bind({})
NameBase64.args = {
  name: base64IconEncoded,
}

export const NameSVGIcon = Template.bind({})
NameSVGIcon.args = {
  name: svgIconDecoded,
}

export const ExternalSVG = Template.bind({})
ExternalSVG.args = {
  name: urlIcon,
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
