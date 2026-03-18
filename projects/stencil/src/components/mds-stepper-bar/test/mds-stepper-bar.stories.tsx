import { h } from '@stencil/core'
import { stepperBarNavigationDictionary } from '../meta/dictionary'

export default {
  title: 'UI / Stepper Bar',
  argTypes: {
    'items-done': {
      type: { name: 'number' },
      description:
        'Sets the current item to the given index: 0 is none selected, 1 is the first item selected, last number + 1 is all items checked',
    },
    navigation: {
      options: stepperBarNavigationDictionary,
      control: { type: 'select' },
      type: { name: 'string' },
      description: 'Sets the navigation type',
    },
  },
}

const Template = args => (
  <mds-stepper-bar {...args}>
    <mds-stepper-bar-item
      badge
      step
      icon-checked="mi/baseline/done"
      icon="mi/baseline/person"
      label="Nuovo account"
    ></mds-stepper-bar-item>
    <mds-stepper-bar-item
      badge
      step
      icon-checked="mi/baseline/done"
      icon="mi/baseline/badge"
      label="Dati personali"
    ></mds-stepper-bar-item>
    <mds-stepper-bar-item
      badge
      step
      icon-checked="mi/baseline/done"
      icon="mi/round/email"
      label="Impostazioni newsletter"
    ></mds-stepper-bar-item>
    <mds-stepper-bar-item
      badge
      step
      icon-checked="mi/baseline/done"
      icon="mi/baseline/lock-open"
      label="Attivazione account"
    ></mds-stepper-bar-item>
    <mds-stepper-bar-item
      badge
      step
      icon-checked="mi/baseline/done"
      icon="mi/baseline/login"
      label="Accedi"
    ></mds-stepper-bar-item>
    <mds-stepper-bar-item
      badge
      step
      icon-checked="mi/baseline/done"
      icon="mi/baseline/done"
      label="Finito"
    ></mds-stepper-bar-item>
    <div
      slot="content"
      class="min-h-8000 flex rounded-lg items-center justify-center bg-label-amaranth-10 text-label-amaranth-04 relative"
    >
      <mds-text>Nuovo account</mds-text>
      <mds-button
        variant="dark"
        class="absolute bottom-600 right-600"
        onClick={() => {
          document
            .querySelector('mds-stepper-bar')
            ?.setAttribute('items-done', '2')
        }}
      >
        Prossimo step
      </mds-button>
    </div>
    <div
      slot="content"
      class="min-h-8000 flex rounded-lg items-center justify-center bg-label-blue-10 text-label-blue-04 relative"
    >
      <mds-text>Dati personali</mds-text>
      <mds-button
        variant="dark"
        class="absolute bottom-600 left-600"
        tone="outline"
        onClick={() => {
          document
            .querySelector('mds-stepper-bar')
            ?.setAttribute('items-done', '1')
        }}
      >
        Indietro
      </mds-button>
      <mds-button
        variant="dark"
        class="absolute bottom-600 right-600"
        onClick={() => {
          document
            .querySelector('mds-stepper-bar')
            ?.setAttribute('items-done', '3')
        }}
      >
        Prossimo step
      </mds-button>
    </div>
    <div
      slot="content"
      class="min-h-8000 flex rounded-lg items-center justify-center bg-label-green-10 text-label-green-04 relative"
    >
      <mds-text>Impostazioni newsletter</mds-text>
      <mds-button
        variant="dark"
        class="absolute bottom-600 left-600"
        tone="outline"
        onClick={() => {
          document
            .querySelector('mds-stepper-bar')
            ?.setAttribute('items-done', '2')
        }}
      >
        Indietro
      </mds-button>
      <mds-button
        variant="dark"
        class="absolute bottom-600 right-600"
        onClick={() => {
          document
            .querySelector('mds-stepper-bar')
            ?.setAttribute('items-done', '4')
        }}
      >
        Prossimo step
      </mds-button>
    </div>
    <div
      slot="content"
      class="min-h-8000 flex rounded-lg items-center justify-center bg-label-orange-10 text-label-orange-04 relative"
    >
      <mds-text>Attivazione account</mds-text>
      <mds-button
        variant="dark"
        class="absolute bottom-600 left-600"
        tone="outline"
        onClick={() => {
          document
            .querySelector('mds-stepper-bar')
            ?.setAttribute('items-done', '3')
        }}
      >
        Indietro
      </mds-button>
      <mds-button
        variant="dark"
        class="absolute bottom-600 right-600"
        onClick={() => {
          document
            .querySelector('mds-stepper-bar')
            ?.setAttribute('items-done', '5')
        }}
      >
        Prossimo step
      </mds-button>
    </div>
    <div
      slot="content"
      class="min-h-8000 flex rounded-lg items-center justify-center bg-label-violet-10 text-label-violet-04 relative"
    >
      <mds-text>Accedi</mds-text>
      <mds-button
        variant="dark"
        class="absolute bottom-600 left-600"
        tone="outline"
        onClick={() => {
          document
            .querySelector('mds-stepper-bar')
            ?.setAttribute('items-done', '4')
        }}
      >
        Indietro
      </mds-button>
      <mds-button
        variant="dark"
        class="absolute bottom-600 right-600"
        onClick={() => {
          document
            .querySelector('mds-stepper-bar')
            ?.setAttribute('items-done', '6')
        }}
      >
        Prossimo step
      </mds-button>
    </div>
    <div
      slot="content"
      class="min-h-8000 flex rounded-lg items-center justify-center bg-label-sky-10 text-label-sky-04 relative"
    >
      <mds-text>Finito</mds-text>
      <mds-button
        variant="dark"
        class="absolute bottom-600 left-600"
        tone="outline"
        onClick={() => {
          document
            .querySelector('mds-stepper-bar')
            ?.setAttribute('items-done', '5')
        }}
      >
        Indietro
      </mds-button>
    </div>
  </mds-stepper-bar>
)

const TemplateOffsetMargin = args => (
  <div class="w-full p-600 bg-tone-neutral shadow-sharp rounded-2xl">
    <mds-stepper-bar {...args}>
      <mds-stepper-bar-item
        badge
        step
        icon-checked="mi/baseline/done"
        icon="mi/baseline/person"
        label="Nuovo account"
      ></mds-stepper-bar-item>
      <mds-stepper-bar-item
        badge
        step
        icon-checked="mi/baseline/done"
        icon="mi/baseline/badge"
        label="Dati personali"
      ></mds-stepper-bar-item>
      <mds-stepper-bar-item
        badge
        step
        icon-checked="mi/baseline/done"
        icon="mi/round/email"
        label="Impostazioni newsletter"
      ></mds-stepper-bar-item>
      <mds-stepper-bar-item
        badge
        step
        icon-checked="mi/baseline/done"
        icon="mi/baseline/lock-open"
        label="Attivazione account"
      ></mds-stepper-bar-item>
      <mds-stepper-bar-item
        badge
        step
        icon-checked="mi/baseline/done"
        icon="mi/baseline/login"
        label="Accedi"
      ></mds-stepper-bar-item>
      <mds-stepper-bar-item
        badge
        step
        icon-checked="mi/baseline/done"
        icon="mi/baseline/done"
        label="Finito"
      ></mds-stepper-bar-item>
      <div
        slot="content"
        class="min-h-8000 flex rounded-lg items-center justify-center bg-label-amaranth-10 text-label-amaranth-04 relative"
      >
        <mds-text>Nuovo account</mds-text>
        <mds-button
          variant="dark"
          class="absolute bottom-600 right-600"
          onClick={() => {
            document
              .querySelector('mds-stepper-bar')
              ?.setAttribute('items-done', '2')
          }}
        >
          Prossimo step
        </mds-button>
      </div>
      <div
        slot="content"
        class="min-h-8000 flex rounded-lg items-center justify-center bg-label-blue-10 text-label-blue-04 relative"
      >
        <mds-text>Dati personali</mds-text>
        <mds-button
          variant="dark"
          class="absolute bottom-600 left-600"
          tone="ghost"
          onClick={() => {
            document
              .querySelector('mds-stepper-bar')
              ?.setAttribute('items-done', '1')
          }}
        >
          Indietro
        </mds-button>
        <mds-button
          variant="dark"
          class="absolute bottom-600 right-600"
          onClick={() => {
            document
              .querySelector('mds-stepper-bar')
              ?.setAttribute('items-done', '3')
          }}
        >
          Prossimo step
        </mds-button>
      </div>
      <div
        slot="content"
        class="min-h-8000 flex rounded-lg items-center justify-center bg-label-green-10 text-label-green-04 relative"
      >
        <mds-text>Impostazioni newsletter</mds-text>
        <mds-button
          variant="dark"
          class="absolute bottom-600 left-600"
          tone="ghost"
          onClick={() => {
            document
              .querySelector('mds-stepper-bar')
              ?.setAttribute('items-done', '2')
          }}
        >
          Indietro
        </mds-button>
        <mds-button
          variant="dark"
          class="absolute bottom-600 right-600"
          onClick={() => {
            document
              .querySelector('mds-stepper-bar')
              ?.setAttribute('items-done', '4')
          }}
        >
          Prossimo step
        </mds-button>
      </div>
      <div
        slot="content"
        class="min-h-8000 flex rounded-lg items-center justify-center bg-label-orange-10 text-label-orange-04 relative"
      >
        <mds-text>Attivazione account</mds-text>
        <mds-button
          variant="dark"
          class="absolute bottom-600 left-600"
          tone="ghost"
          onClick={() => {
            document
              .querySelector('mds-stepper-bar')
              ?.setAttribute('items-done', '3')
          }}
        >
          Indietro
        </mds-button>
        <mds-button
          variant="dark"
          class="absolute bottom-600 right-600"
          onClick={() => {
            document
              .querySelector('mds-stepper-bar')
              ?.setAttribute('items-done', '5')
          }}
        >
          Prossimo step
        </mds-button>
      </div>
      <div
        slot="content"
        class="min-h-8000 flex rounded-lg items-center justify-center bg-label-violet-10 text-label-violet-04 relative"
      >
        <mds-text>Accedi</mds-text>
        <mds-button
          variant="dark"
          class="absolute bottom-600 left-600"
          tone="ghost"
          onClick={() => {
            document
              .querySelector('mds-stepper-bar')
              ?.setAttribute('items-done', '4')
          }}
        >
          Indietro
        </mds-button>
        <mds-button
          variant="dark"
          class="absolute bottom-600 right-600"
          onClick={() => {
            document
              .querySelector('mds-stepper-bar')
              ?.setAttribute('items-done', '6')
          }}
        >
          Prossimo step
        </mds-button>
      </div>
      <div
        slot="content"
        class="min-h-8000 flex rounded-lg items-center justify-center bg-label-sky-10 text-label-sky-04 relative"
      >
        <mds-text>Finito</mds-text>
        <mds-button
          variant="dark"
          class="absolute bottom-600 left-600"
          tone="ghost"
          onClick={() => {
            document
              .querySelector('mds-stepper-bar')
              ?.setAttribute('items-done', '5')
          }}
        >
          Indietro
        </mds-button>
      </div>
    </mds-stepper-bar>
  </div>
)

export const Default = {
  render: Template,
}

export const OffsetMargin = {
  render: TemplateOffsetMargin,

  args: {
    style: { '--mds-stepper-bar-offset-margin': '24px' },
  },
}

export const ScrollbarNavigation = {
  render: Template,

  args: {
    navigation: 'scrollbar',
  },
}

export const Select = {
  render: Template,

  args: {
    'items-done': 3,
  },
}
