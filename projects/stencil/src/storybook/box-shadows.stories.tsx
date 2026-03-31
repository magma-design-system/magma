import { h } from '@stencil/core'
import boxShadowTokens from '../../../design-tokens/tokens/cosmetic/box-shadow.json'

export default {
  title: 'Common tests',
}

type BoxShadowTokenMap = Record<string, { value: string }>

const ShadowsGroup = ({ children, label }: { children?: unknown, label: string }) => {
  return (
    <div class="grid gap-600 last:p-0 last:border-b-0 pb-1200 border-b-2 border-solid border-0 border-tone-neutral-08">
      <mds-text typography='h4'>{label}</mds-text>
      <div class="grid gap-1200 desktop:grid-cols-6 tablet:grid-cols-4 mobile:grid-cols-2">
        {children}
      </div>
    </div>
  )
}

const BoxShadow = ({ value, label, remove }: { value: string, label: string, remove?: boolean }) => {
  return (
    <div class="aspect-square w-full">
      <div class="aspect-square w-full bg-tone-neutral rounded-md flex items-center justify-center" style={{ boxShadow: value }}>
        <div class="grid gap-100 text-center">
          {remove && <mds-icon name="mi/baseline/close" class="fill-status-error-06"></mds-icon>}
          <mds-text typography='option'>{label}</mds-text>
        </div>
      </div>
    </div>
  )
}

const boxShadowDictionary = (boxShadowTokens.cosmetic.boxShadow as BoxShadowTokenMap)
const boxShadowEntries = Object.entries(boxShadowDictionary)

const getShadowGroup = (name: string): string => {
  if (name.startsWith('box')) return 'Box'
  if (name.startsWith('glow')) return 'Glow'
  if (name.startsWith('highlight')) return 'Highlight'
  if (name.startsWith('inset')) return 'Inset'
  if (name.startsWith('outline')) return 'Outline'
  return 'Default'
}

const groupedShadows = boxShadowEntries.reduce((acc, [name, token]) => {
  const group = getShadowGroup(name)
  if (!acc[group]) {
    acc[group] = []
  }
  acc[group].push({ name, value: token.value })
  return acc
}, {} as Record<string, Array<{ name: string, value: string }>>)

const groupOrder = ['Default', 'Outline', 'Glow', 'Box', 'Highlight', 'Inset']

const StackedDocuments = ({ value }: { value: string }) => (
  <div class="flex justify-start items-center">
    <div class="text-center px-400 aspect-a4 flex bg-tone-neutral w-1/3 relative rounded-3xs items-center justify-center" style={{ boxShadow: value }}>
      <mds-text typography='label'>Stacked documents</mds-text>
      <div class="bg-tone-neutral flex left-100 right-100 top-100 -bottom-100 absolute -z-10 rounded-3xs" style={{ boxShadow: value }}></div>
      <div class="bg-tone-neutral flex left-200 right-200 top-200 -bottom-200 absolute -z-20 rounded-3xs" style={{ boxShadow: value }}></div>
    </div>
  </div>
)

const Template = () => (
  <div class="grid gap-1200">
    {groupOrder.map(group => (
      groupedShadows[group] && groupedShadows[group].length > 0 && (
        <ShadowsGroup label={group}>
          {groupedShadows[group].map(shadow => (
            <BoxShadow value={shadow.value} label={shadow.name} remove={shadow.name === 'none'} />
          ))}
        </ShadowsGroup>
      )
    ))}
    <StackedDocuments value={boxShadowDictionary['box-lg'].value} />
    <div>
      <mds-button label="Button" icon="mi/baseline/add" class="pb-50" style={{ boxShadow: boxShadowDictionary['box-2xl'].value }}></mds-button>
    </div>
  </div>
)



export const BoxShadows = {
  render: Template,
}

