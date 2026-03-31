import { h } from '@stencil/core'

export default {
  title: 'Common tests',
}

const ShadowsGroup = ({ children, label }: { children?: unknown, label: string }) => {
  return (
    <div class="grid gap-600">
      <mds-text typography='h4'>{label}</mds-text>
      <div class="grid gap-1200 desktop:grid-cols-6 tablet:grid-cols-4 mobile:grid-cols-2">
        {children}
      </div>
    </div>
  )
}

const BoxShadow = ({ shadow, label, remove }: { shadow: string, label: string, remove?: boolean }) => {
  return (
    <div class="aspect-square w-full">
      <div class={`aspect-square w-full bg-tone-neutral rounded-md flex items-center justify-center ${shadow}`}>
        <div class="grid gap-100 text-center">
          {remove && <mds-icon name="mi/baseline/close" class="fill-status-error-06"></mds-icon>}
          <mds-text typography='option'>{label}</mds-text>
        </div>
      </div>
    </div>
  )
}

/*
--shadow-box-2xl
--shadow-box-lg
--shadow-box-md
--shadow-box-xl
--shadow-glow-distant
--shadow-glow-near
--shadow-glow-strong
--shadow-glow-weak
--shadow-highlight-md
--shadow-highlight-strong
--shadow-highlight-weak
--shadow-outline-glow
--shadow-outline-md
--shadow-outline-strong
--shadow-outline-weak
*/

const StackedDocuments = () => (
  <div class="flex justify-start items-center">
    <div class="text-center px-400 shadow-box-lg aspect-a4 flex bg-tone-neutral w-1/3 relative rounded-3xs items-center justify-center">
      <mds-text typography='label'>Stacked documents</mds-text>
      <div class="shadow-box-lg bg-tone-neutral flex left-100 right-100 top-100 -bottom-100 absolute -z-10 rounded-3xs"></div>
      <div class="shadow-box-lg bg-tone-neutral flex left-200 right-200 top-200 -bottom-200 absolute -z-20 rounded-3xs"></div>
    </div>
  </div>
)


const Template = () => (
  <div class="grid gap-1200">
    <ShadowsGroup label="Glow">
      <BoxShadow shadow="shadow-glow-near-strong" label="glow-near-strong"/>
      <BoxShadow shadow="shadow-glow-distant-weak" label="glow-distant-weak"/>
      <BoxShadow shadow="shadow-glow-distant-strong" label="glow-distant-strong"/>
    </ShadowsGroup>
    <ShadowsGroup label="Box">
      <BoxShadow shadow="shadow-box-md" label="box-md"/>
      <BoxShadow shadow="shadow-box-lg" label="box-lg"/>
      <BoxShadow shadow="shadow-box-xl" label="box-xl"/>
      <BoxShadow shadow="shadow-box-2xl" label="box-2xl"/>
    </ShadowsGroup>
    <ShadowsGroup label="Outline">
      <BoxShadow shadow="shadow-outline-glow-weak" label="outline-glow-weak"/>
      <BoxShadow shadow="shadow-outline-glow-strong" label="outline-glow-strong"/>
      <BoxShadow shadow="shadow-outline-weak" label="outline-weak"/>
      <BoxShadow shadow="shadow-outline-md" label="outline-md"/>
      <BoxShadow shadow="shadow-outline-strong" label="outline-strong"/>
    </ShadowsGroup>
    <ShadowsGroup label="Highlight">
      <BoxShadow shadow="shadow-highlight-weak" label="highlight-weak"/>
      <BoxShadow shadow="shadow-highlight-md" label="highlight-md"/>
      <BoxShadow shadow="shadow-highlight-strong" label="highlight-strong"/>
    </ShadowsGroup>
    <StackedDocuments />
    <div>
      <mds-button label="Button" icon="mi/baseline/add" class="shadow-box-2xl pb-50"></mds-button>
    </div>
  </div>
)



export const BoxShadows = {
  render: Template,
}

