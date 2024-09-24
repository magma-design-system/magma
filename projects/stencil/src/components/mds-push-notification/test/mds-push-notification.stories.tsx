import { h } from '@stencil/core'
import { iconsDictionary } from '@dictionary/icon'
import { themeFullVariantAvatarDictionary, toneMinimalVariantDictionary } from '@dictionary/variant'
import { notificationPreviewDictionary, notificationDateFormatDictionary } from '../meta/dictionary'

const timePadding = 45
let itemsCreated = 10

const getDatetime = (): string => {
  const datetime = new Date(new Date().getTime() - (timePadding * itemsCreated) * 1000)
  itemsCreated += 1
  return datetime.toString()
}

export default {
  title: 'UI / Push Notifications / Push Notification',
  argTypes: {
    datetime: {
      type: { name: 'string' },
      description: 'Specifies the notification date based on [standard ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html).',
    },
    'date-format': {
      type: { name: 'string' },
      description: 'Specifies if the notification date format shows time passed or displays date as a static string',
      options: notificationDateFormatDictionary,
      control: { type: 'select' },
    },
    deletable: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is dismissable or not, it should be set to true by default is used with it\'s parent component `mds-push-notifications`',
    },
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

const TemplateWithAttachmentBadge = args =>
  <div>
    <mds-push-notification {...args}>
      <mds-badge slot="badge" variant="amaranth" tone="quiet">pdf</mds-badge>
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
  datetime: getDatetime(),
  icon: 'mi/baseline/email',
  message: 'You have 3 new messages from different accounts',
  subject: 'New messages',
}

export const Thumb = Template.bind({})
Thumb.args = {
  datetime: getDatetime(),
  message: 'Image can be 48px max wide',
  src: './book-cover-01.webp',
  subject: 'Preview image',
}

export const Variant = TemplateWithAction.bind({})
Variant.args = {
  datetime: getDatetime(),
  icon: 'mi/baseline/done',
  message: 'Description of the article changed successfully',
  subject: 'Article',
  variant: 'success',
}

export const Attachment = TemplateWithAttachment.bind({})
Attachment.args = {
  datetime: getDatetime(),
  icon: 'mi/baseline/attach-file',
  message: 'You\'ve got a new file attachment from Mark',
  subject: 'New attachment',
  variant: 'primary',
}

export const AttachmentBadge = TemplateWithAttachmentBadge.bind({})
AttachmentBadge.args = {
  datetime: getDatetime(),
  icon: 'mi/baseline/attach-file',
  message: 'You\'ve got a new file attachment from Mark',
  subject: 'New attachment',
  variant: 'primary',
}

export const Contact = TemplateContact.bind({})
Contact.args = {
  datetime: getDatetime(),
  icon: 'mi/baseline/person',
  message: 'Ciao, sono Mario, questo è il mio contatto, buona giornata!',
  subject: 'Mario Giannini',
  tone: 'strong',
  variant: 'primary',
}

export const ContactAvatar = TemplateContact.bind({})
ContactAvatar.args = {
  datetime: getDatetime(),
  message: 'Ciao, sono Sarah, questo è il mio contatto, buona giornata!',
  preview: 'avatar',
  src: './avatar-05-200x200.jpeg',
  subject: 'Sarah Ho',
  tone: 'strong',
  variant: 'primary',
}

export const ContactAvatarInitials = TemplateContact.bind({})
ContactAvatarInitials.args = {
  datetime: getDatetime(),
  initials: 'sh',
  message: 'Ciao, sono Sarah, questo è il mio contatto, buona giornata!',
  preview: 'avatar',
  subject: 'Sarah Ho',
  tone: 'strong',
  variant: 'primary',
}

export const DateTime = Template.bind({})
DateTime.args = {
  datetime: getDatetime(),
  message: 'Ciao, sono Sarah, questo è il mio contatto, buona giornata!',
  preview: 'avatar',
  src: './avatar-05-200x200.jpeg',
  subject: 'Sarah Ho',
  tone: 'strong',
  variant: 'primary',
}

export const DateFormat = Template.bind({})
DateFormat.args = {
  'date-format': 'none',
  datetime: '2023-12-12',
  message: 'Ciao, sono Sarah, questo è il mio contatto, buona giornata!',
  preview: 'avatar',
  src: './avatar-05-200x200.jpeg',
  subject: 'Sarah Ho',
  tone: 'strong',
  variant: 'primary',
}
