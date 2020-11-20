import React from 'react'
import faker from 'faker'

import InlineCode from '@UI/InlineCode/InlineCode'
import Flash from '@UI/Flash/Flash'
import Grid from '@Layout/Grid/Grid'

export default {
  title: 'UI/InlineCode',
  component: InlineCode,
}

export const basicUsage = () =>
  <InlineCode>
    {faker.hacker.adjective()}: {faker.hacker.verb()};
  </InlineCode>

export const statusInfo = () =>
  <Grid>
    <Flash status="info">The <InlineCode status="info">status</InlineCode> property, is designed for <InlineCode status="info">Flash</InlineCode> component (this component)</Flash>
    <div>
      <InlineCode status="info">
        {faker.hacker.adjective()}: {faker.hacker.verb()};
      </InlineCode>
    </div>
  </Grid>

export const statusWarning = () =>
  <Grid>
    <Flash status="warning">The <InlineCode status="warning">status</InlineCode> property, is designed for <InlineCode status="warning">Flash</InlineCode> component (this component)</Flash>
    <div>
      <InlineCode status="warning">
        {faker.hacker.adjective()}: {faker.hacker.verb()};
      </InlineCode>
    </div>
  </Grid>

export const statusError = () =>
  <Grid>
    <Flash status="error">The <InlineCode status="error">status</InlineCode> property, is designed for <InlineCode status="error">Flash</InlineCode> component (this component)</Flash>
    <div>
      <InlineCode status="error">
        {faker.hacker.adjective()}: {faker.hacker.verb()};
      </InlineCode>
    </div>
  </Grid>

export const statusSuccess = () =>
  <Grid>
    <Flash status="success">The <InlineCode status="success">status</InlineCode> property, is designed for <InlineCode status="success">Flash</InlineCode> component (this component)</Flash>
    <div>
      <InlineCode status="success">
        {faker.hacker.adjective()}: {faker.hacker.verb()};
      </InlineCode>
    </div>
  </Grid>
