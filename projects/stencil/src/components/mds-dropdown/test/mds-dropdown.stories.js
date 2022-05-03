import React from 'react'
import MdsDropdown from '@component/mds-dropdown/mds-dropdown'
import clsx from 'clsx'

export default {
  title: 'UI / Dropdown',
  component: MdsDropdown,
  argTypes: {
    opened: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is opened',
    },
  },
}

const Template = ({ layout, ...args }) =>
  <div className={clsx(layout)}>
    <mds-button for="my-dropdown">Show Fred</mds-button>
    <mds-dropdown id="my-dropdown" {...args}>
      <mds-author class="text-adjust-tone-04">
        <mds-avatar initials="fb" src="./fred-brooks-zoom.webp" slot="avatar" class="w-20 bg-brand-maggioli-06"/>
        <mds-text typography="h6" class="text-adjust-tone-02">Fred Brooks</mds-text>
        <mds-text typography="caption">Software engineer</mds-text>
        <mds-text typography="caption">IT</mds-text>
      </mds-author>
      <mds-text typography="detail" class="text-tone-neutral-04">
        Frederick Phillips "Fred" Brooks Jr. (born April 19, 1931) is an American computer architect, software engineer, and computer scientist.
      </mds-text>
      <mds-hr class="h-[2px] bg-tone-neutral-08"/>
      <mds-button class="justify-start" icon="mi/baseline/info" variant="dark" tone="quiet">User infos</mds-button>
      <mds-button class="justify-start" icon="mi/baseline/settings" variant="dark" tone="quiet">Account</mds-button>
      <mds-button class="justify-start" icon="mi/baseline/logout" variant="dark" tone="quiet">Exit</mds-button>
    </mds-dropdown>
  </div>

export const Default = Template.bind({})
Default.args = {
  class: 'w-[350px]',
}
