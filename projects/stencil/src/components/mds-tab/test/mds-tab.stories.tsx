import { h } from '@stencil/core'

export default {
  title: 'UI / Tab',
}

const Template = args =>
  <mds-tab {...args}>
    <mds-notification strategy="absolute" target="button" value={14} visible={true}/>
    <mds-tab-item selected class="mobile:flex-1" label="First Blood">
      <div class="bg-label-amaranth-06/20 min-h-[200px]">Content First Blood</div>
    </mds-tab-item>
    <mds-tab-item icon="mdi/alien" id="button" class="mobile:flex-1" label="Second Impact">
      <div class="bg-label-yellow-06/20 min-h-[400px]">Content Second Impact</div>
    </mds-tab-item>
    <mds-tab-item class="mobile:flex-1" label="The Third Reich">
      <div class="bg-label-green-06/20 min-h-[600px]">Content The Third Reich</div>
    </mds-tab-item>
  </mds-tab>

export const Default = Template.bind({})
