import { h } from '@stencil/core'
import { iconsDictionary, mggIconsDictionary, svgIconsDictionary } from '@dictionary/icon'
import { useState } from 'react'
import svgIconPackage from '@maggioli-design-system/svg-icons/package.json'
import '@maggioli-design-system/svg-icons/dist/iconsauce.json'

const urlIcon = `${location.origin}/svg/mi/baseline/email.svg`
const base64IconEncoded = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgLTk2MCA5NjAgOTYwIiB3aWR0aD0iMjQiPjxwYXRoIGQ9Im0yMzMtODAgNjUtMjgxTDgwLTU1MGwyODgtMjUgMTEyLTI2NSAxMTIgMjY1IDI4OCAyNS0yMTggMTg5IDY1IDI4MS0yNDctMTQ5TDIzMy04MFoiLz48L3N2Zz4='
const svgIconDecoded = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6s-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8s-3.58-8-8-8z"/></svg>'

export default {
  title: 'Design / Icon',
  argTypes: {
    name: {
      type: { name: 'string' },
      description: 'The name of the icon or a base64 string to render it as an svg',
      options: mggIconsDictionary.concat(iconsDictionary).concat(svgIconsDictionary),
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

const ListIconsTemplate = () => {
  const [filteredIcons, setFilteredIcons] = useState<string[]>(mggIconsDictionary)

  return <div class="flex flex-col gap-y-400">
    <div class="flex flex-col gap-y-600">
      <mds-text>
        La seguente è una lista delle icone presenti nel pacchetto <strong>@maggioli-design-system/svg-icons {svgIconPackage.version}</strong>, facente riferimento alle icone di Maggioli
      </mds-text>
      <mds-text>
        Oltre a questo set, <strong>@maggioli-design-system/icons</strong> fa uso anche delle librerie di <a href="https://fonts.google.com/icons">Material Icons</a> e <a href="https://pictogrammers.com/library/mdi/">Material Design Icons</a>, la cui lista può essere consultata sui relativi siti.
      </mds-text>
    </div>
    <div class="flex flex-col gap-y-600">
      <mds-input name="filter" placeholder='Cerca icona ...' onInput={event => {
        const _filter = (event.target as HTMLMdsInputElement).value ?? ''

        if (!_filter) {
          setFilteredIcons([...mggIconsDictionary])
          return
        }

        setFilteredIcons(mggIconsDictionary.filter(item => item.includes(_filter)))
      }} />
      <div class="grid grid-cols-5 gap-400">
        {filteredIcons.map(icon => <div key={icon} class="flex flex-col justify-center items-center">
          <mds-icon class="w-1200 fill-brand-maggioli-05" name={icon} />
          <mds-text>{icon}</mds-text>
        </div>)}
      </div>
    </div>
  </div>
}
export const ListIcons = ListIconsTemplate.bind({})
