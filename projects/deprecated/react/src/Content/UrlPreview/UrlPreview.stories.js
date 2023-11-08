import React from 'react'
import faker from 'faker'

import UrlPreview from '@Content/UrlPreview/UrlPreview'
import Button from '@UI/Button/Button'
import Toggler from '@Behavior/Toggler/Toggler'

faker.locale = 'it'

export default {
  title: 'Content/UrlPreview',
  component: UrlPreview,
}

export const basicUsage = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri URL Previewer
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <UrlPreview url="https://stylable.io/"/>
      </Toggler.Content>
    </Toggler>
  )
}

export const customShadow = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri URL Previewer
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <UrlPreview
          centered={true}
          size="wide"
          url="https://stylable.io/"
          windowClassName="shadow-2xl"
        />
      </Toggler.Content>
    </Toggler>
  )
}

export const sizeSmall = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri URL Previewer
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <UrlPreview
          size="small"
          url="https://stylable.io/"
        />
      </Toggler.Content>
    </Toggler>
  )
}

export const sizeSmallCentered = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri URL Previewer
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <UrlPreview
          centered={true}
          url="https://stylable.io/"
        />
      </Toggler.Content>
    </Toggler>
  )
}

export const sizeWide = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri URL Previewer
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <UrlPreview
          size="wide"
          url="https://stylable.io/"
        />
      </Toggler.Content>
    </Toggler>
  )
}

export const sizeWideCentered = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri URL Previewer
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <UrlPreview
          size="wide"
          centered
          url="https://stylable.io/"
        />
      </Toggler.Content>
    </Toggler>
  )
}

export const sizeFitWindow = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri URL Previewer
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <UrlPreview
          centered={true}
          size="fit-window"
          title="iLibro"
          url="https://stylable.io/"
        />
      </Toggler.Content>
    </Toggler>
  )
}

export const titleCustom = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri URL Previewer
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <UrlPreview
          title="Stylable"
          url="https://stylable.io/"
        />
      </Toggler.Content>
    </Toggler>
  )
}

export const titleAuto = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri URL Previewer
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <UrlPreview
          url="https://stylable.io/docs/getting-started/intro"
        />
      </Toggler.Content>
    </Toggler>
  )
}

export const titleFalse = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri URL Previewer
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <UrlPreview
          title={false}
          url="https://stylable.io/"
        />
      </Toggler.Content>
    </Toggler>
  )
}
