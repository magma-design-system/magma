import React from 'react'
import faker from 'faker'
import UploadFileImage from '@UI/UploadFileImage/UploadFileImage'
faker.locale = 'it'

export default {
  title: 'UI/UploadFileImage',
  component: UploadFileImage,
}

export const basicUsage = () =>
  <UploadFileImage/>
