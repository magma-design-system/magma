import React from 'react'

import Link from './Link'
import Paragraph from '@Typography/Paragraph/Paragraph'

export default {
  title: 'Pattern/Link',
  component: Link,
}

export const basicUsage = () =>
  <Paragraph>
    Visita la pagina del <Link href="http://www.maggioli.com">Gruppo Maggioli</Link> per avere maggiori informazioni.
  </Paragraph>
