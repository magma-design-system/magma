import React from 'react'
import MdsHeader from '@component/mds-header/mds-header'
import faker from 'faker'
import { iconsDictionary } from '@dictionary/icon'

const getIcon = () =>
  iconsDictionary[faker.datatype.number(iconsDictionary.length - 1)]

export default {
  title: 'UI / Header',
  component: MdsHeader,
  argTypes: {},
}

const Template = args =>
  <mds-header {...args}>
    <div className="flex gap-2 items-center">
      <mds-img class="w-10" src="./logo-gruppo-maggioli.svg"/>
      <div className="mb-1">
        <mds-text typography="h6">Gruppo Maggioli</mds-text>
        <mds-text typography="option" class="text-adjust-tone-08">Header by RD Team</mds-text>
      </div>
    </div>
    <mds-button slot="nav" variant="dark" tone="ghost">Login</mds-button>
    <mds-button slot="nav">Register</mds-button>
    <div slot="nav-mobile">
      <div className="grid gap-2 p-6">
        <mds-button variant="dark" tone="ghost">Login</mds-button>
        <mds-button>Register</mds-button>
      </div>
    </div>
  </mds-header>

export const Default = Template.bind({})
