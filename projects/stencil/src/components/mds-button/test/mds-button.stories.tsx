import { h } from '@stencil/core'
import { iconsDictionary } from '@dictionary/icon'
import {
  buttonVariantDictionary,
  buttonSizeDictionary,
  buttonToneVariantDictionary,
  buttonTargetDictionary,
  buttonIconPositionDictionary,
  buttonTypeDictionary,
} from '@dictionary/button'
import { useEffect, useState } from 'react'

export default {
  title: 'UI / Button',
  argTypes: {
    'auto-focus': {
      type: { name: 'boolean' },
      description:
        'Specifies if the component is focused when is loaded on the viewport',
    },
    await: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is awaiting to load a response',
    },
    disabled: {
      type: { name: 'boolean' },
      description: 'Specifies if the component is disabled or not',
    },
    href: {
      type: { name: 'string' },
      description: 'Specifies the URL target of the button',
    },
    icon: {
      type: { name: 'string' },
      description:
        'The name of the icon set. The icon set is strictly realted to @maggioli-design-system/icons',
      options: iconsDictionary,
      control: { type: 'select' },
    },
    'icon-position': {
      type: { name: 'string' },
      description:
        'Specifies the horizontal position of the icon displayed in the button',
      options: buttonIconPositionDictionary,
      control: { type: 'select' },
    },
    size: {
      type: { name: 'string' },
      description: 'Specifies the size of the button',
      options: buttonSizeDictionary,
      control: { type: 'select' },
    },
    target: {
      type: { name: 'string' },
      options: buttonTargetDictionary,
      description: 'Specifies the target of the URL, if self or blank',
      control: { type: 'select' },
    },
    tone: {
      type: { name: 'string' },
      description: 'Specifies the tone variant of the button',
      options: buttonToneVariantDictionary,
      control: { type: 'select' },
    },
    variant: {
      type: { name: 'string' },
      description: 'Specifies the variant of the button',
      options: buttonVariantDictionary,
      control: { type: 'select' },
    },
    type: {
      type: { name: 'string' },
      description: 'Specifies the type of the button',
      options: buttonTypeDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args => <mds-button {...args}>Conferma azione</mds-button>

const TemplateService = args => (
  <mds-button {...args}>{args.label}</mds-button>
)

const TemplateNotifications = args => (
  <mds-button {...args}>
    Notifiche
    <mds-notification slot="notification" value={12}></mds-notification>
  </mds-button>
)

const TemplateAwait = () => {
  const [buttonState, setButtonState] = useState(0)

  const iconMap = {
    0: 'mi/baseline/eco',
    1: undefined,
    2: 'mi/baseline/done',
  }

  const variantsMap = {
    0: 'primary',
    1: 'primary',
    2: 'success',
  }

  const tonesMap = {
    0: 'strong',
    1: 'weak',
    2: 'strong',
  }

  function setLoadingState () {
    setButtonState(1)
    setTimeout(() => {
      setButtonState(2)
      setTimeout(() => {
        setButtonState(0)
      }, 2000)
    }, 2000)
  }

  return (
    <mds-button
      icon={iconMap[buttonState]}
      variant={variantsMap[buttonState]}
      tone={tonesMap[buttonState]}
      await={buttonState === 1}
      onClick={() => {
        if (buttonState === 0) setLoadingState()
      }}
    >
      {buttonState === 0 && 'Conferma azione'}
      {buttonState === 1 && 'Salvataggio in corso...'}
      {buttonState === 2 && 'Azione salvata'}
    </mds-button>
  )
}

const TemplateKeyboard = args => (
  <div class="bg-tone-grey-10 p-600 grid gap-600">
    <mds-text>Focus this button with tab before press enter.</mds-text>
    <mds-button {...args}>Click me from enter keyborad</mds-button>
  </div>
)

const TemplateIcon = args => <mds-button {...args}> </mds-button>

const TemplateForm = args => (
  <form
    class="flex gap-x-400"
    action="#"
    onSubmit={event => {
      event.preventDefault()

      // eslint-disable-next-line no-console
      console.log('Form submitted via mds-button', event)

      return false
    }}
  >
    <input type="text" name="inputTest" />
    <mds-button {...args}>Cliccami</mds-button>
  </form>
)

const TemplateDisabled = () => {
  const [disabled, setDisabled] = useState(false)

  function toggle () {
    setDisabled(!disabled)
    console.info('disabled', disabled)
  }

  function enableButton () {
    setDisabled(false)
    // document.querySelector('#disabledButton')?.setAttribute('disabled', 'false')
  }

  return (
    <div class="grid grid-cols-1 gap-600">
      <div class="inline-flex gap-600">
        <mds-button
          id="disabledButton"
          class="w-4400"
          icon={disabled ? 'mi/baseline/block' : 'mi/baseline/check'}
          variant="primary"
          disabled={disabled}
          onClick={() => toggle()}
        >
          {disabled ? 'Disabled button' : 'Click to disable'}
        </mds-button>
        {disabled && (
          <mds-button
            icon="mi/baseline/undo"
            variant="dark"
            tone="weak"
            onClick={() => enableButton()}
          >
            Reset
          </mds-button>
        )}
      </div>
    </div>
  )
}

const TemplateAsyncContent = () => {
  const [icon, setIcon] = useState('')
  const [label, setLabel] = useState('')

  useEffect(() => {
    setTimeout(() => {
      setIcon('mi/baseline/check')
      setTimeout(() => {
        setLabel('Hello async world')
      }, 1000)
    }, 1000)
  }, [icon, label])

  return (
    <mds-button class="max-w-4400" icon={icon}>
      {label}
    </mds-button>
  )
}

export const Default = {
  render: Template,
}

export const AsyncContent = {
  render: TemplateAsyncContent,
}

export const AutoFocus = {
  render: Template,

  args: {
    'auto-focus': true,
  },
}

export const Await = {
  render: TemplateAwait,

  args: {
    tone: 'weak',
    await: true,
  },
}

export const Disabled = {
  render: TemplateDisabled,

  args: {
    disabled: false,
  },
}

export const Variant = {
  render: Template,

  args: {
    variant: 'success',
  },
}

export const ServiceVariantGoogle = {
  render: TemplateService,

  args: {
    variant: 'google',
    label: 'Login with Google',
  },
}

export const ServiceVariantApple = {
  render: TemplateService,

  args: {
    variant: 'apple',
    label: 'Login with Apple',
  },
}

export const Tone = {
  render: Template,

  args: {
    variant: 'success',
    tone: 'weak',
  },
}

export const Size = {
  render: Template,

  args: {
    size: 'sm',
  },
}

export const Icon = {
  render: TemplateIcon,

  args: {
    icon: 'mi/baseline/eco',
    title: 'Pianta un albero',
  },
}

export const IconFill = {
  render: TemplateIcon,

  args: {
    variant: 'success',
    icon: 'mi/baseline/eco',
    class: 'fill-status-error-05',
  },
}

export const IconARIATitle = {
  render: TemplateIcon,

  args: {
    icon: 'mi/baseline/eco',
    'aria-label': 'Pianta un albero',
  },
}

export const IconPosition = {
  render: Template,

  args: {
    'icon-position': 'right',
    icon: 'mi/baseline/eco',
  },
}

export const KeyboardPress = {
  render: TemplateKeyboard,

  args: {
    onClick: () => {
      console.info('Button clicked')
    },
  },
}

export const Href = {
  render: Template,

  args: {
    href: 'http://www.maggioli.it',
  },
}

export const Target = {
  render: Template,

  args: {
    href: 'http://www.maggioli.it',
    target: 'blank',
  },
}

export const Notifications = {
  render: TemplateNotifications,
}

export const FormParticipation = {
  render: TemplateForm,

  args: {
    type: 'button',
  },
}
