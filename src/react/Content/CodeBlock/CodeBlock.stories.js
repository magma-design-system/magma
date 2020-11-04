import React from 'react'
import faker from 'faker'

import CodeBlock from '@Content/CodeBlock/CodeBlock'
import Code from '@UI/Code/Code'
import Flash from '@UI/Flash/Flash'
import Grid from '@Layout/Grid/Grid'
import Link from '@UI/Link/Link'

faker.locale = 'it'

export default {
  title: 'Content/CodeBlock',
  component: CodeBlock,
}

const InfoFlash = () =>
  <Flash status="info">
    The component <Code className="background-color-status-info-16 color-status-info-04">CodeBlock</Code> is based on <Link href="https://github.com/react-syntax-highlighter/react-syntax-highlighter#readme" className="color-status-info-04">React Syntax Highlighter</Link>, please read it's documentation for more details.
  </Flash>

const jsCode =
`function test() {
  console.log(this is a test)
}`

export const basicUsage = () =>
  <Grid>
    <CodeBlock language="javascript">
      { jsCode }
    </CodeBlock>
    <InfoFlash/>
  </Grid>

export const JavascriptDark = () =>
  <CodeBlock language="javascript" theme="dark">
    { jsCode }
  </CodeBlock>

const scssCode =
`.selector {
  $color: red;
  background-color: $red;
}`

export const languageSCSS = () =>
  <CodeBlock language="scss">
    { scssCode }
  </CodeBlock>

export const languageSCSSDark = () =>
  <CodeBlock language="scss" theme="dark">
    { scssCode }
  </CodeBlock>
