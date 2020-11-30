import React from 'react'
import faker from 'faker'

import Tooltip, { TooltipBalloon } from '@UI/Tooltip/Tooltip'
import Button from '@UI/Button/Button'
import Card from '@Layout/Card/Card'
import Detail from '@Typography/Detail/Detail'

faker.locale = 'it'

export default {
  title: 'UI/Tooltip',
  component: Tooltip,
}

export const basicUsage = () => {
  <Card>
    <Tooltip>
      <TooltipBalloon onConfirm={() => console.log('onConfirm')} onCancel={() => console.log('onCancel')}>
        <Detail>{faker.lorem.paragraph()}</Detail>
      </TooltipBalloon>
      <Button icon="status-info">
        Do something
      </Button>
    </Tooltip>
  </Card>
}
