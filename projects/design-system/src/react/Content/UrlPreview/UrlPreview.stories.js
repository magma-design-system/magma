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

export const wide = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri URL Previewer
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <UrlPreview wide={true} url="https://stylable.io/"/>
      </Toggler.Content>
    </Toggler>
  )
}

export const centered = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri URL Previewer
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <UrlPreview wide={true} centered={true} url="https://stylable.io/"/>
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
        <UrlPreview wide={true} centered={true} boxShadow="strong" url="https://stylable.io/"/>
      </Toggler.Content>
    </Toggler>
  )
}

/*

export const mobileModeLeft = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri modale
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <Modal position="left" onConfirm={() => console.log('onConfirm')} onCancel={() => console.log('onCancel')}>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </Modal>
      </Toggler.Content>
    </Toggler>
  )
}

export const desktopMode = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri modale
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <Modal desktopMode={true}>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </Modal>
      </Toggler.Content>
    </Toggler>
  )
}

export const desktopModeSimple = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri modale
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <Modal desktopMode={true} footer={false}>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </Modal>
      </Toggler.Content>
    </Toggler>
  )
}

export const headerTitle = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri modale
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <Modal title={faker.lorem.sentence()} desktopMode={true} onConfirm={() => console.log('onConfirm')} onCancel={() => console.log('onCancel')}>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </Modal>
      </Toggler.Content>
    </Toggler>
  )
}

export const maxHeight = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri modale
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <Modal maxHeight={true} title={faker.lorem.sentence()} desktopMode={true} onConfirm={() => console.log('onConfirm')} onCancel={() => console.log('onCancel')}>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </Modal>
      </Toggler.Content>
    </Toggler>
  )
}

export const simple = () => {
  return (
    <Toggler>
      <Toggler.Trigger>
        <Button icon="status-info">
          Apri modale
        </Button>
      </Toggler.Trigger>
      <Toggler.Content>
        <Modal footer={false} maxHeight={true} title={faker.lorem.sentence()} desktopMode={true} onConfirm={() => console.log('onConfirm')} onCancel={() => console.log('onCancel')}>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
          <Paragraph>{faker.lorem.paragraph()}</Paragraph>
        </Modal>
      </Toggler.Content>
    </Toggler>
  )
}
*/
