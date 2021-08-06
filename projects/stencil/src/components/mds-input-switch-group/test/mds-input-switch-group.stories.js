import React from 'react'
import faker from 'faker'
import MdsInputSwitchGroup from '@component/mds-input-switch-group/mds-input-switch-group'

export default {
  title: 'Form / Switch Group',
  component: MdsInputSwitchGroup,
}

const Template = args =>
  <div>
    Switch Group: {args.names[0]}
    <mds-input-switch-group name={args.names[0]}>
      <div className="grid grid-cols-1 gap-4">
        <mds-input-switch name={args.names[0]} type="radio" value="1">{faker.lorem.words(10)}</mds-input-switch>
        <mds-input-switch name={args.names[0]} type="radio" value="2">{faker.lorem.words(10)}</mds-input-switch>
        <mds-input-switch name={args.names[0]} type="radio" value="3">{faker.lorem.words(10)}</mds-input-switch>
        <mds-input-switch name={args.names[0]} type="radio" value="4">{faker.lorem.words(10)}</mds-input-switch>
      </div>
    </mds-input-switch-group>
    <hr></hr>
    Switch Group: {args.names[1]}
    <mds-input-switch-group name={args.names[1]}>
      <div className="grid grid-cols-1 gap-4">
        <mds-input-switch name={args.names[1]} type="radio" value="1">{faker.lorem.words(10)}</mds-input-switch>
        <mds-input-switch name={args.names[1]} type="radio" value="2">{faker.lorem.words(10)}</mds-input-switch>
        <mds-input-switch name={args.names[1]} type="radio" value="3">{faker.lorem.words(10)}</mds-input-switch>
        <mds-input-switch name={args.names[1]} type="radio" value="4">{faker.lorem.words(10)}</mds-input-switch>
      </div>
    </mds-input-switch-group>
  </div>

export const Default = Template.bind({})
Default.args = {
  names: ['switch-radio-1', 'switch-radio-2'],
}
