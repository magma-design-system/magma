import { h } from '@stencil/core'
import { useEffect } from 'react'

export default {
  title: 'Form / Range',
  argTypes: {
    disabled: {
      type: { name: 'boolean' },
      description: 'Sets if the component is disabled',
    },
    min: {
      type: { name: 'number' },
      description: 'The lowest value in the range of permitted values',
    },
    max: {
      type: { name: 'number' },
      description: 'The greatest value in the range of permitted values',
    },
    step: {
      type: { name: 'number' },
      description:
        'The step attribute is a number that specifies the granularity that the value must adhere to, or the special value any, which is described below',
    },
    value: {
      type: { name: 'number' },
      description:
        'The value attribute contains a number which contains a representation of the selected number',
    },
  },
}

const Template = args => (
  <mds-input-range {...args}>Range label</mds-input-range>
)

const TemplateFormatLabel = args => {
  useEffect(() => {
    (
      document.querySelector('#custom-labeled') as HTMLMdsInputRangeElement
    ).formatValue = formatValue
  }, [])
  function formatValue (v: number) {
    return formatBytes(v)
  }

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 B'

    const k = 1024
    const sizes = ['B', 'kB', 'MB', 'GB', 'TB', 'PB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    const value = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))
    return `${value} ${sizes[i]}`
  }

  return (
    <div>
      <mds-input-range
        id="custom-labeled"
        {...args}
        step="1048576"
        min="0"
        max="1073741824"
      >
        File size
      </mds-input-range>
    </div>
  )
}

const hideHeaderCss = `
  mds-input-range::part(header) {
    display: none;
  }
`

const HideHeaderTemplate = args => (
  <div>
    <style>{hideHeaderCss}</style>
    <mds-input-range {...args}>This shouldn't be visible</mds-input-range>
  </div>
)

export const Default = {
  render: Template,
}

export const Disabled = {
  render: Template,

  args: {
    disabled: true,
  },
}

export const Min = {
  render: Template,

  args: {
    min: -100,
  },
}

export const Max = {
  render: Template,

  args: {
    max: 200,
  },
}

export const Step = {
  render: Template,

  args: {
    step: 10,
  },
}

export const Value = {
  render: Template,

  args: {
    value: 90,
  },
}

export const FormatLabel = {
  render: TemplateFormatLabel,
}

export const HideHeader = {
  render: HideHeaderTemplate,
}
