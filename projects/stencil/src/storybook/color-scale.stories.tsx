import { h } from '@stencil/core'
import { ThemeFullVariantType, ThemeVariantType, ToneSimpleVariantType } from '@type/variant'
// import { useState } from 'react'

const colorGroups = [
  'tone',
  'status',
  'label',
  'variant',
]

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1)

const colors = [
  'tone-slate',
  'tone-grey',
  'tone-zinc',
  'tone-neutral',
  'tone-stone',
  'status-info',
  'status-success',
  'status-error',
  'status-warning',
  'label-red',
  'label-amaranth',
  'label-orchid',
  'label-purple',
  'label-violet',
  'label-blue',
  'label-sky',
  'label-aqua',
  'label-green',
  'label-lime',
  'label-yellow',
  'label-orange',
  'variant-primary',
  'variant-secondary',
  'variant-ai',
]

const colorScale = [
  '',
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
]

const colorPalette = {
  tone: [
    'slate',
    'grey',
    'zinc',
    'neutral',
    'stone',
  ],
  status: [
    'info',
    'success',
    'error',
    'warning',
  ],
  label: [
    'red',
    'amaranth',
    'orchid',
    'violet',
    'purple',
    'blue',
    'sky',
    'aqua',
    'green',
    'lime',
    'yellow',
    'orange',
  ],
  variant: [
    'primary',
    'secondary',
    'ai',
  ],
}

const variantTones = [
  'strong',
  'outline',
  'weak',
  'text',
]
// let selectedGroup: keyof typeof colorPalette = 'variant'
const selectedDefaultVariant: ThemeVariantType = 'primary'
const selectedDefaultTone: ToneSimpleVariantType = 'strong'


/*
bg-tone-slate
bg-tone-slate-01
bg-tone-slate-02
bg-tone-slate-03
bg-tone-slate-04
bg-tone-slate-05
bg-tone-slate-06
bg-tone-slate-07
bg-tone-slate-08
bg-tone-slate-09
bg-tone-slate-10
bg-tone-grey
bg-tone-grey-01
bg-tone-grey-02
bg-tone-grey-03
bg-tone-grey-04
bg-tone-grey-05
bg-tone-grey-06
bg-tone-grey-07
bg-tone-grey-08
bg-tone-grey-09
bg-tone-grey-10
bg-tone-zinc
bg-tone-zinc-01
bg-tone-zinc-02
bg-tone-zinc-03
bg-tone-zinc-04
bg-tone-zinc-05
bg-tone-zinc-06
bg-tone-zinc-07
bg-tone-zinc-08
bg-tone-zinc-09
bg-tone-zinc-10
bg-tone-neutral
bg-tone-neutral-01
bg-tone-neutral-02
bg-tone-neutral-03
bg-tone-neutral-04
bg-tone-neutral-05
bg-tone-neutral-06
bg-tone-neutral-07
bg-tone-neutral-08
bg-tone-neutral-09
bg-tone-neutral-10
bg-tone-stone
bg-tone-stone-01
bg-tone-stone-02
bg-tone-stone-03
bg-tone-stone-04
bg-tone-stone-05
bg-tone-stone-06
bg-tone-stone-07
bg-tone-stone-08
bg-tone-stone-09
bg-tone-stone-10
bg-status-info
bg-status-info-01
bg-status-info-02
bg-status-info-03
bg-status-info-04
bg-status-info-05
bg-status-info-06
bg-status-info-07
bg-status-info-08
bg-status-info-09
bg-status-info-10
bg-status-success
bg-status-success-01
bg-status-success-02
bg-status-success-03
bg-status-success-04
bg-status-success-05
bg-status-success-06
bg-status-success-07
bg-status-success-08
bg-status-success-09
bg-status-success-10
bg-status-error
bg-status-error-01
bg-status-error-02
bg-status-error-03
bg-status-error-04
bg-status-error-05
bg-status-error-06
bg-status-error-07
bg-status-error-08
bg-status-error-09
bg-status-error-10
bg-status-warning
bg-status-warning-01
bg-status-warning-02
bg-status-warning-03
bg-status-warning-04
bg-status-warning-05
bg-status-warning-06
bg-status-warning-07
bg-status-warning-08
bg-status-warning-09
bg-status-warning-10
bg-label-red
bg-label-red-01
bg-label-red-02
bg-label-red-03
bg-label-red-04
bg-label-red-05
bg-label-red-06
bg-label-red-07
bg-label-red-08
bg-label-red-09
bg-label-red-10
bg-label-amaranth
bg-label-amaranth-01
bg-label-amaranth-02
bg-label-amaranth-03
bg-label-amaranth-04
bg-label-amaranth-05
bg-label-amaranth-06
bg-label-amaranth-07
bg-label-amaranth-08
bg-label-amaranth-09
bg-label-amaranth-10
bg-label-orchid
bg-label-orchid-01
bg-label-orchid-02
bg-label-orchid-03
bg-label-orchid-04
bg-label-orchid-05
bg-label-orchid-06
bg-label-orchid-07
bg-label-orchid-08
bg-label-orchid-09
bg-label-orchid-10
bg-label-violet
bg-label-violet-01
bg-label-violet-02
bg-label-violet-03
bg-label-violet-04
bg-label-violet-05
bg-label-violet-06
bg-label-violet-07
bg-label-violet-08
bg-label-violet-09
bg-label-violet-10
bg-label-purple
bg-label-purple-01
bg-label-purple-02
bg-label-purple-03
bg-label-purple-04
bg-label-purple-05
bg-label-purple-06
bg-label-purple-07
bg-label-purple-08
bg-label-purple-09
bg-label-purple-10
bg-label-blue
bg-label-blue-01
bg-label-blue-02
bg-label-blue-03
bg-label-blue-04
bg-label-blue-05
bg-label-blue-06
bg-label-blue-07
bg-label-blue-08
bg-label-blue-09
bg-label-blue-10
bg-label-sky
bg-label-sky-01
bg-label-sky-02
bg-label-sky-03
bg-label-sky-04
bg-label-sky-05
bg-label-sky-06
bg-label-sky-07
bg-label-sky-08
bg-label-sky-09
bg-label-sky-10
bg-label-aqua
bg-label-aqua-01
bg-label-aqua-02
bg-label-aqua-03
bg-label-aqua-04
bg-label-aqua-05
bg-label-aqua-06
bg-label-aqua-07
bg-label-aqua-08
bg-label-aqua-09
bg-label-aqua-10
bg-label-green
bg-label-green-01
bg-label-green-02
bg-label-green-03
bg-label-green-04
bg-label-green-05
bg-label-green-06
bg-label-green-07
bg-label-green-08
bg-label-green-09
bg-label-green-10
bg-label-lime
bg-label-lime-01
bg-label-lime-02
bg-label-lime-03
bg-label-lime-04
bg-label-lime-05
bg-label-lime-06
bg-label-lime-07
bg-label-lime-08
bg-label-lime-09
bg-label-lime-10
bg-label-yellow
bg-label-yellow-01
bg-label-yellow-02
bg-label-yellow-03
bg-label-yellow-04
bg-label-yellow-05
bg-label-yellow-06
bg-label-yellow-07
bg-label-yellow-08
bg-label-yellow-09
bg-label-yellow-10
bg-label-orange
bg-label-orange-01
bg-label-orange-02
bg-label-orange-03
bg-label-orange-04
bg-label-orange-05
bg-label-orange-06
bg-label-orange-07
bg-label-orange-08
bg-label-orange-09
bg-label-orange-10
bg-variant-primary
bg-variant-primary-01
bg-variant-primary-02
bg-variant-primary-03
bg-variant-primary-04
bg-variant-primary-05
bg-variant-primary-06
bg-variant-primary-07
bg-variant-primary-08
bg-variant-primary-09
bg-variant-primary-10
bg-variant-secondary
bg-variant-secondary-01
bg-variant-secondary-02
bg-variant-secondary-03
bg-variant-secondary-04
bg-variant-secondary-05
bg-variant-secondary-06
bg-variant-secondary-07
bg-variant-secondary-08
bg-variant-secondary-09
bg-variant-secondary-10
bg-variant-ai
bg-variant-ai-01
bg-variant-ai-02
bg-variant-ai-03
bg-variant-ai-04
bg-variant-ai-05
bg-variant-ai-06
bg-variant-ai-07
bg-variant-ai-08
bg-variant-ai-09
bg-variant-ai-10
*/
export default {
  title: 'Common tests',
}

type ComponentVariantsProps = {
  variant?: ThemeVariantType
  tone?: ToneSimpleVariantType
}

const ComponentVariants = ({ variant = 'primary', tone = 'strong' }: ComponentVariantsProps) => {
  return (
    <div class="grid gap-600 grid-cols-full justify-items-start">
      <mds-banner id="color-scale-preview-banner" headline="Banner component" icon="mi/baseline/warning" variant={variant} tone={tone}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
        <mds-button variant={variant} tone="text" slot="action">Cancel action</mds-button>
        <mds-button variant={variant} tone="strong" slot="action">Confirm action</mds-button>
      </mds-banner>
      <mds-badge id="color-scale-preview-badge" variant={variant as ThemeFullVariantType} tone={tone}>badge component</mds-badge>
      {variant}
      <mds-button await variant={variant} tone={tone} onClick={() => console.info('clicked')}>Click me</mds-button>
    </div>
  )
}

const ColorGrid = ({ group, selected }: { group: string, selected: boolean }) => {
  const groupColors = colors.filter(color => color.startsWith(group))
  return (
    <mds-accordion-item label={capitalize(group)} selected={selected}>
      <div class="grid grid-cols-11 [border border-solid] w-full">
        {groupColors.map(color =>
          colorScale.map(scale => (
            <ColorItem color={color} scale={scale} />
          )),
        )}
      </div>
    </mds-accordion-item>
  )
}

const ColorItem = ({ color, scale }: { color: string, scale: string }) => {
  const colorClass = `bg-${color}${scale ? `-${scale}` : ''}`
  return (
    <div class={`color-item aspect-square flex items-start p-100 justify-start ${colorClass}`}>
      <div class={`inline-flex px-100 py-50 ${scale ? 'bg-transparent' : ''} ${color.startsWith('tone') ? 'bg-tone-neutral-09' : 'bg-tone-neutral'}`}>
        {scale
          ? <mds-text class={`${Number(scale) > 5 ? 'text-tone-neutral-01' : 'text-tone-neutral'}`} typography='option'>{ scale }</mds-text>
          : <mds-text class="text-tone-neutral-01" typography='option'>{ color.split('-')[1] }</mds-text>
        }
      </div>
    </div>
  )
}

const Template = () => {

  const selectedVariant = selectedDefaultVariant
  const selectedTone = selectedDefaultTone
  // const [selectedVariant, setSelectedVariant] = useState<ThemeVariantType>(selectedDefaultVariant)
  // const [selectedTone, setSelectedTone] = useState<ToneSimpleVariantType>(selectedDefaultTone)

  return (
    <div class="grid-cols-full grid tablet:grid-cols-[3fr_2fr] gap-600">
      <mds-accordion class="auto-rows-min" closable={false}>
        {colorGroups.map(group => (
          <ColorGrid group={group} selected={group === 'tone'}/>
        ))}
      </mds-accordion>
      <div class="sticky top-0 self-start p-600 grid gap-600 grid-cols-full">
        <div class="grid gap-600 grid-cols-2">
          <mds-input-field label="group" class="col-span-2">
            <mds-input-select id="color-scale-group-select">
              {colorGroups.map(group => (
                <option value={group}>{capitalize(group)}</option>
              ))}
            </mds-input-select>
          </mds-input-field>
          <mds-input-field label="variant">
            <mds-input-select id="color-scale-variant-select">
              {colorPalette.variant.map(name => (
                <option value={name}>{capitalize(name)}</option>
              ))}
            </mds-input-select>
          </mds-input-field>
          <mds-input-field label="tone">
            <mds-input-select id="color-scale-tone-select">
              {variantTones.map(name => (
                <option value={name}>{capitalize(name)}</option>
              ))}
            </mds-input-select>
          </mds-input-field>
        </div>
        <ComponentVariants variant={selectedVariant} tone={selectedTone} />
      </div>
    </div>
  )
}

export const ColorScale = {
  render: Template,
}
