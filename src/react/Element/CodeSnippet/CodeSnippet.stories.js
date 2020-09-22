import React from 'react'
import faker from 'faker'

import CodeSnippet from '@Element/CodeSnippet/CodeSnippet'

faker.locale = 'it'

export default {
  title: 'Element/CodeSnippet',
  component: CodeSnippet,
}

export const defaultUsage = () =>
  <CodeSnippet language="javascript">
    var date = new Date();
  </CodeSnippet>

export const languageScss = () =>
  <CodeSnippet language="scss" code={`
    $size: 32px;
    .selector {
      height: $size;
      width: $size;
    }
  `}/>
