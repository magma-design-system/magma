import React from 'react'

import ExternalLink from '@UI/ExternalLink/ExternalLink'
import Paragraph from '@Typography/Paragraph/Paragraph'

export default {
  title: 'UI/ExternalLink',
  component: ExternalLink,
}

export const basicUsage = () =>
  <Paragraph>
    Visita la pagina del <ExternalLink href="http://www.maggioli.com">Gruppo Maggioli</ExternalLink> per avere maggiori informazioni.
  </Paragraph>
