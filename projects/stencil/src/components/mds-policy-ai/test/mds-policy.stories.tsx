import { h } from '@stencil/core'

import { policyAiDictionary } from '../meta/dictionary'

export default {
  title: 'UI / Policy AI',
  argTypes: {
    headline: {
      type: { name: 'string' },
      description: 'Specifies the headline to custom component short text',
    },
    description: {
      type: { name: 'string' },
      description: 'Specifies the description to custom component long text',
    },
    variant: {
      type: { name: 'string' },
      description: 'Specifies the element variant',
      options: policyAiDictionary,
      control: { type: 'select' },
    },
  },
}

const Template = args =>
  <mds-policy-ai {...args} class="max-w-[400px]"></mds-policy-ai>

const TemplateCustomIcon = () =>
  <div class="grid gap-600 tablet:grid-cols-[200px_auto] p-600 bg-tone-neutral-10 rounded-xl max-w-[500px]">
    <div class="mobile:max-w-[200px] relative">
      <mds-policy-ai variant="icon" class="absolute bottom-200 right-200 z-10"></mds-policy-ai>
      <mds-img src="/book-cover-06.webp" class="rounded-md shadow-sm"></mds-img>
    </div>
    <div class="grid gap-400 auto-rows-min">
      <mds-text typography='h5'>Lorem ipsum dolor sit amet, consectetur adipisicing elit</mds-text>
      <mds-text typography='detail'>Rem nostrum alias, optio illum vel autem perspiciatis, sapiente earum neque amet temporibus ipsam voluptates eveniet distinctio totam, inventore nulla quaerat eius?</mds-text>
    </div>
  </div>

const TemplateCustomChip = args =>
  <div class="grid gap-600 tablet:grid-cols-[200px_auto] p-600 bg-tone-neutral-10 rounded-xl max-w-[500px]">
    <mds-img src="/book-cover-02.webp" class="rounded-md shadow-sm mobile:max-w-[200px]"></mds-img>
    <div class="grid gap-400 auto-rows-min">
      <mds-text typography='h5'>Lorem ipsum dolor sit amet, consectetur adipisicing elit</mds-text>
      <mds-text typography='detail'>Rem nostrum alias, optio illum vel autem perspiciatis, sapiente earum neque amet temporibus ipsam voluptates eveniet distinctio totam, inventore nulla quaerat eius?</mds-text>
      <mds-policy-ai {...args} class="max-w-[400px]"></mds-policy-ai>
    </div>
  </div>

const TemplateCustomCard = args =>
  <div class="grid gap-600 bg-tone-neutral-10 rounded-xl p-600 max-w-[480px]">
    <div class="grid gap-600">
      <mds-img src="/book-cover-05.webp" class="rounded-md shadow-sm max-w-[200px] self-start"></mds-img>
      <div class="grid gap-400 auto-rows-min">
        <mds-text typography='h5'>Lorem ipsum dolor sit amet, consectetur adipisicing elit</mds-text>
        <mds-text typography='detail'>Rem nostrum alias, optio illum vel autem perspiciatis, sapiente earum neque amet temporibus ipsam voluptates eveniet distinctio totam, inventore nulla quaerat eius?</mds-text>
        <mds-text typography='detail'>Rem nostrum alias, optio illum vel autem perspiciatis, sapiente earum neque amet temporibus ipsam voluptates eveniet distinctio totam, inventore nulla quaerat eius?</mds-text>
        <mds-text typography='detail'>Rem nostrum alias, optio illum vel autem perspiciatis, sapiente earum neque amet temporibus ipsam voluptates eveniet distinctio totam, inventore nulla quaerat eius?</mds-text>
      </div>
    </div>
    <div class="grid">
      <mds-text typography='h4'>FAQ</mds-text>
      <mds-accordion>
        <mds-accordion-item label="Sapiente earum neque amet temporibus ipsam?">
          <mds-text typography='detail'>Rem nostrum alias, optio illum vel autem perspiciatis, sapiente earum neque amet temporibus ipsam voluptates eveniet distinctio totam, inventore nulla quaerat eius?</mds-text>
        </mds-accordion-item>
        <mds-accordion-item label="Inventore nulla quaerat eius?">
          <mds-text typography='detail'>Rem nostrum alias, optio illum vel autem perspiciatis, sapiente earum neque amet temporibus ipsam voluptates eveniet distinctio totam, inventore nulla quaerat eius?</mds-text>
        </mds-accordion-item>
        <mds-accordion-item label="Voluptatibus aliquam hic quam?">
          <mds-text typography='detail'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia nesciunt id, perspiciatis quod exercitationem quis, asperiores maxime quasi dolore voluptatem distinctio doloribus totam natus ipsum aliquam. Voluptatibus aliquam hic quam.</mds-text>
        </mds-accordion-item>
      </mds-accordion>
      <mds-policy-ai {...args}></mds-policy-ai>
    </div>
  </div>

const TemplateCustomBanner = args =>
  <div class="grid gap-600 max-w-[728px] m-auto">
    <div class="grid gap-600 tablet:grid-cols-[200px_auto]">
      <mds-img src="/book-cover-05.webp" class="rounded-md shadow-sm max-w-[200px] self-start"></mds-img>
      <div class="grid gap-400 auto-rows-min">
        <mds-text typography='h2'>Lorem ipsum dolor sit amet, consectetur adipisicing elit</mds-text>
        <mds-text typography='detail'>Rem nostrum alias, optio illum vel autem perspiciatis, sapiente earum neque amet temporibus ipsam voluptates eveniet distinctio totam, inventore nulla quaerat eius?</mds-text>
        <mds-author>
          <mds-avatar slot="avatar" initials="er" tone='weak'></mds-avatar>
          <mds-text typography='h6'>Ettore Rossi</mds-text>
          <mds-text typography='caption'>Autore ed Architetto Ambientale</mds-text>
        </mds-author>
      </div>
    </div>
    <mds-hr class="bg-tone-neutral-10"></mds-hr>
    <div class="grid gap-400">
      <mds-text typography='h4'>Descrizione</mds-text>
      <mds-text typography='paragraph'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Accusamus, quae dolorum. In quas eaque sed numquam sapiente nesciunt perferendis, autem id ratione possimus ex harum? Accusantium officia nostrum illum a!</mds-text>
      <mds-text typography='paragraph'>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Facere et doloribus accusamus voluptatum accusantium distinctio eius culpa id quo perspiciatis facilis aut exercitationem neque, repellat vel delectus? Consectetur, eveniet tempora.</mds-text>
      <mds-text typography='paragraph'>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Voluptates modi voluptas saepe velit aut. Modi velit deleniti inventore, dolore est fugit delectus amet, doloribus, recusandae earum hic cupiditate iste impedit.</mds-text>
      <mds-policy-ai {...args}></mds-policy-ai>
    </div>
  </div>

const TemplateBanner = args =>
  <mds-policy-ai {...args}></mds-policy-ai>


export const Default = Template.bind({})

export const Icon = Template.bind({})
Icon.args = {
  variant: 'icon',
}
export const Chip = Template.bind({})
Chip.args = {
  variant: 'chip',
}
export const Card = Template.bind({})
Card.args = {
  variant: 'card',
}
export const Banner = TemplateBanner.bind({})
Banner.args = {
  variant: 'banner',
}

export const ExampleIcon = TemplateCustomIcon.bind({})
ExampleIcon.args = {
  variant: 'icon',
}
export const ExampleChip = TemplateCustomChip.bind({})
ExampleChip.args = {
  variant: 'chip',
  headline: 'Extract generato con AI',
  description: 'L’estratto che stai leggendo è stato generato tramite i nostri servizi di intelligenza artificiale e potrebbe contenere inesattezze, ti invitiamo a verificare le informazioni.',
}
export const ExampleCard = TemplateCustomCard.bind({})
ExampleCard.args = {
  variant: 'card',
  headline: 'Extract generato con AI',
  description: 'Le FAQ che stai leggendo sono generate tramite i nostri servizi di intelligenza artificiale e potrebbe contenere inesattezze, ti invitiamo a verificare le informazioni.',
}
export const ExampleBanner = TemplateCustomBanner.bind({})
ExampleBanner.args = {
  variant: 'banner',
}
