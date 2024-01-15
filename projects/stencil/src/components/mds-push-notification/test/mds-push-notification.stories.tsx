import { h } from '@stencil/core'
import { iconsDictionary } from '@dictionary/icon'
import { themeFullVariantAvatarDictionary, toneMinimalVariantDictionary } from '@dictionary/variant'
import { notificationPreviewDictionary } from '../meta/dictionary'

export default {
  title: 'UI / Push Notification',
  argTypes: {
    icon: {
      type: { name: 'string' },
      description: 'Specifies the icon to be displayed if src propery is not used',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    message: {
      type: { name: 'string' },
      description: 'Specifies the message of the component',
    },
    prevew: {
      type: { name: 'string' },
      description: 'Specifies if the `src` attribute is used to show a the image as avatar or full image',
      options: notificationPreviewDictionary,
      control: { type: 'select' },
    },
    initials: {
      type: { name: 'string' },
      description: 'The user\'s inizials displayed if there\'s no image available, initials will override tone and variant senttings to keep user recognizable from others',
    },
    src: {
      type: { name: 'string' },
      description: 'The URL of the image to be loaded',
    },
    subject: {
      type: { name: 'string' },
      description: 'Specifies the subject of the component',
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
  <div>
    <mds-push-notification {...args}></mds-push-notification>
  </div>

const TemplateWithAction = args =>
  <div>
    <mds-push-notification {...args}>
      <mds-button slot="actions" variant={args.variant} tone="weak" size="sm">Show</mds-button>
    </mds-push-notification>
  </div>

const TemplateWithAttachment = args =>
  <div>
    <mds-push-notification {...args}>
      <mds-button slot="actions" tone="ghost" size="sm">Download</mds-button>
    </mds-push-notification>
  </div>

const TemplateContact = args =>
  <div>
    <mds-push-notification {...args}>
      <mds-button slot="actions" variant="success" tone="weak" size="sm">Write</mds-button>
      <mds-button slot="actions" variant="error" tone="weak" size="sm">Ignore</mds-button>
    </mds-push-notification>
  </div>


export const Default = Template.bind({})
Default.args = {
  icon: 'mi/baseline/email',
  message: 'You have 3 new messages from different accounts',
  subject: 'New messages',
}

export const Thumb = Template.bind({})
Thumb.args = {
  message: 'Image can be 48px max wide',
  src: './book-cover-01.webp',
  subject: 'Preview image',
}

export const Variant = TemplateWithAction.bind({})
Variant.args = {
  message: 'Description of the article changed successfully',
  icon: 'mi/baseline/done',
  subject: 'Article',
  variant: 'success',
}

export const Attachment = TemplateWithAttachment.bind({})
Attachment.args = {
  message: 'You\'ve got a new file attachment from Mark',
  icon: 'mi/baseline/attach-file',
  subject: 'New attachment',
  variant: 'primary',
}

export const Contact = TemplateContact.bind({})
Contact.args = {
  message: 'Ciao, sono Mario, questo è il mio contatto, buona giornata!',
  icon: 'mi/baseline/person',
  subject: 'Mario Giannini',
  tone: 'strong',
  variant: 'primary',
}

export const ContactAvatar = TemplateContact.bind({})
ContactAvatar.args = {
  message: 'Ciao, sono Sarah, questo è il mio contatto, buona giornata!',
  src: './avatar-05-200x200.jpeg',
  subject: 'Sarah Ho',
  preview: 'avatar',
  tone: 'strong',
  variant: 'primary',
}

export const ContactAvatarInitials = TemplateContact.bind({})
ContactAvatarInitials.args = {
  message: 'Ciao, sono Sarah, questo è il mio contatto, buona giornata!',
  initials: 'sh',
  subject: 'Sarah Ho',
  preview: 'avatar',
  tone: 'strong',
  variant: 'primary',
}
