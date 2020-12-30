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

export const basicUsage = () =>
  <Card>
    <br/>
    <br/>
    <br/>
    <br/>
    <br/>
    <br/>
    <div>
      <Tooltip>
        <TooltipBalloon onConfirm={() => console.log('onConfirm')} onCancel={() => console.log('onCancel')}>
          <Detail>{faker.lorem.sentences()}</Detail>
        </TooltipBalloon>
        <Button icon="status-info">
          Hello
        </Button>
      </Tooltip>
    </div>
  </Card>
