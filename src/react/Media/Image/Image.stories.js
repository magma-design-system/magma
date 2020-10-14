import React from 'react'
import faker from 'faker'

import Image from '@Media/Image/Image'
import Flash from '@Element/Flash/Flash'
import Code from '@Element/Code/Code'
import Grid from '@Layout/Grid/Grid'

faker.locale = 'it'

export default {
  title: 'Media/Image',
  component: Image,
}

const CodeWarning = props =>
  <Code className="background-color-status-warning-16 color-status-warning-05">{props.children}</Code>

const WarningMessage = () =>
  <Flash status="warning" className="text-secondary text-secondary--paragraph">
    Utilizzare la proprietà <CodeWarning>aspectRatio</CodeWarning> cambia la struttura del markup impedento alla property <CodeWarning>loading</CodeWarning> di essere settata, in quanto l'immagine viene trattata come uno stile CSS <CodeWarning>background-image</CodeWarning>.
  </Flash>

export const defaultUsage = () =>
  <Image src="//via.placeholder.com/700x350" />

export const aspectRatioCinema = () =>
  <Grid>
    <WarningMessage/>
    <Image src="//via.placeholder.com/700x350" aspectRatio="16:9"/>
  </Grid>

export const aspectRatioSquare = () =>
  <Grid>
    <WarningMessage/>
    <Image src="//via.placeholder.com/700x350" aspectRatio="1:1"/>
  </Grid>

export const imageSource = () =>
  <Image src="//via.placeholder.com/800x600" aspectRatio="16:9" sourceTitle="Illustration by Freepik Stories" sourceUrl="https://stories.freepik.com/"/>

export const imageSourceTitle = () =>
  <Image src="//via.placeholder.com/800x600" aspectRatio="16:9" sourceTitle="Illustration by Freepik Stories"/>

export const imageSourceUrl = () =>
  <Image src="//via.placeholder.com/800x600" aspectRatio="16:9" sourceUrl="https://stories.freepik.com/"/>
