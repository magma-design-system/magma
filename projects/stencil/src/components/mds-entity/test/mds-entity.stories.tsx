import { h } from '@stencil/core'
import { useState } from 'react'
import { iconsDictionary } from '@dictionary/icon'
import { themeFullVariantAvatarDictionary, toneMinimalVariantDictionary } from '@dictionary/variant'

export default {
  title: 'UI / Entity',
  argTypes: {
    await: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is awaiting a response from an external resource',
    },
    icon: {
      type: { name: 'string' },
      description: 'Specifies the icon to be displayed if src propery is not used',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    initials: {
      type: { name: 'string' },
      description: 'The user\'s inizials displayed if there\'s no image available and icon is not set',
    },
    src: {
      type: { name: 'string' },
      description: 'The URL of the avatar image',
    },
    tone: {
      type: { name: 'string' },
      description: 'Specifies the tone variant of the component',
      options: toneMinimalVariantDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string' },
      description: 'Specifies the variant of the component',
      options: themeFullVariantAvatarDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-entity {...args} aria-label="Personaggio">
    <mds-text truncate="word" aria-label="Nome" typography="h6">Mario Rossi</mds-text>
    <mds-badge aria-label="Carattere" slot="detail" variant="orange" tone="weak">buono</mds-badge>
    <mds-text truncate="word" aria-label="Email" slot="detail" typography="caption">mario@nintendo.com</mds-text>
    <mds-button onClick={() => { console.info('Restore') }} slot="action" icon="mdi/replay" variant="primary" tone="strong" title="Restore"/>
    <mds-button onClick={() => { console.info('Delete') }} slot="action" icon="mdi/delete" variant="error" tone="strong" title="Delete"/>
  </mds-entity>

const TemplateLocation = args =>
  <mds-entity {...args} aria-label="Luogo">
    <mds-text truncate="word" aria-label="Nome" typography="h6">Maggioli Headquarters</mds-text>
    <mds-text truncate="word" aria-label="Strada" slot="detail" typography="caption">Via Pinelli 64, Santarcangelo di Romanga, Italy</mds-text>
    <mds-button slot="action" icon="mdi/map-marker" variant="primary" tone="strong" title="Go to Google Maps"/>
  </mds-entity>

const TemplateDownload = args => {
  const [ isUploading, setUpload ] = useState(true)
  const [ isComplete, setUploadComplete ] = useState(false)
  let message = 'Upload in corso...'
  if (isUploading) {
    message = 'Upload in corso...'
  } else {
    message = 'Upload annullato'
  }
  if (isComplete) {
    message = 'Upload comlpetato con successo'
  }
  return <div class="grid gap-400 grid-cols-full">
    <mds-entity await={isUploading && !isComplete} icon={isComplete ? 'mi/baseline/done' : 'mi/baseline/remove-circle'} variant={isComplete ? 'success' : 'warning'} {...args} aria-label="File">
      <mds-text truncate="word" aria-label="Nome" typography="h6">Report finanziario 2024.docx</mds-text>
      <mds-text truncate="word" aria-label="Stato caricamento" slot="detail" typography="caption">{ message }</mds-text>
      { isUploading && !isComplete && <mds-button onClick={() => setUpload(false)} slot="action" icon="mi/baseline/cancel" variant="light" title="Annulla upload"/> }
    </mds-entity>
    <div class="flex gap-400 flex-wrap justify-between">
      <mds-button onClick={() => { setUploadComplete(false); setUpload(true) }} variant="dark" tone="ghost">Riavvia</mds-button>
      <mds-button onClick={() => {setUploadComplete(true)}}>Completa upload</mds-button>
    </div>
  </div>
}
  

export const Default = Template.bind({})
Default.args = {
  src: './avatar-mario-01.png',
}

export const Icon = TemplateLocation.bind({})
Icon.args = {
  icon: 'mi/baseline/route',
}

export const Uploading = TemplateDownload.bind({})
Uploading.args = {
  tone: 'weak',
}
