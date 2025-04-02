import { h } from '@stencil/core'
import { horizontalActionsAnimationDictionary } from '@dictionary/animation'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

export default {
  title: 'UI / Tab',
  argTypes: {
    animation: {
      type: { name: 'string' },
      description: 'Sets the animation type of the selection transition between `mds-tab-item` elements',
      options: horizontalActionsAnimationDictionary,
      control: { type: 'select' },
    },
    fill: {
      description: 'Sets if the tab area should fill the entire width',
      type: { name: 'boolean' },
    },
    overflow: {
      description: 'Sets if the tab area should show an inset shadow when the tabs overflows it\'s container',
      type: { name: 'boolean' },
    },
    scrollbar: {
      description: 'Specifies if the scrollbar is visible or not',
      type: { name: 'boolean' },
    },
  },
}

const TemplateEmpty = args => {

  const [currentElement, setCurrentElement] = useState(0)

  useEffect(() => {
    const manualTabsEl = document.querySelector('#manual-tabs')
    if (!manualTabsEl) return

    manualTabsEl.addEventListener('mdsTabChange', (event: CustomEvent) => {
      setCurrentElement(event.detail.id)
    })
  }, [])

  return (<div class="grid gap-600">
    <mds-tab id="manual-tabs" {...args}>
      <mds-tab-item selected>First Blood</mds-tab-item>
      <mds-tab-item icon="mdi/alien" id="button">Double Impact</mds-tab-item>
      <mds-tab-item>The Third Man</mds-tab-item>
    </mds-tab>
    { currentElement === 0 && <div class="min-h-[400px] flex items-center justify-center p-600 bg-label-amaranth-09 rounded-2xl"><mds-text>This is the first tab contents</mds-text></div> }
    { currentElement === 1 && <div class="min-h-[400px] flex items-center justify-center p-600 bg-label-blue-09 rounded-2xl"><mds-text>This is the second tab contents</mds-text></div> }
    { currentElement === 2 && <div class="min-h-[400px] flex items-center justify-center p-600 bg-label-green-09 rounded-2xl"><mds-text>This is the third tab contents</mds-text></div> }
  </div>)
}


const SectionComponent = ({ id, className, title, slot = 'none' }) => {
  return <div id={id} slot={slot !== 'none' ? slot : undefined} class={clsx('grid gap-100 p-600 auto-rows-min scroll-mt-2000 rounded-2xl', className)}>
    <mds-text typography='h3'>{ title }</mds-text>
    <mds-text>This content is outside the mds-tab component.</mds-text>
  </div>
}

const TemplateScroll = () =>
  <div class="grid gap-600 pt-[60px]">
    <div class="fixed top-0 left-0 right-0 p-400 px-600 shadow-sm flex bg-tone-neutral">
      <mds-tab>
        <mds-tab-item href="#section-1" selected>Section 1</mds-tab-item>
        <mds-tab-item href="#section-2">Section 2</mds-tab-item>
        <mds-tab-item href="#section-3">Section 3</mds-tab-item>
      </mds-tab>
    </div>
    <div class="grid gap-600">
      <SectionComponent id="section-1" className="bg-label-amaranth-09 min-h-screen" title="Section 1"/>
      <SectionComponent id="section-2" className="bg-label-blue-09 min-h-screen" title="Section 2"/>
      <SectionComponent id="section-3" className="bg-label-orange-09 min-h-screen" title="Section 3"/>
    </div>
  </div>

const TemplateAsyncContent = () => {
  const [tabContentLoaded, loadTabContent] = useState(false)
  useEffect(() => {
    const interval = setTimeout(() => {
      loadTabContent(true) // Correct way to update state
    }, 1000)
    return () => clearTimeout(interval) // Cleanup function
  }, [])

  return <div class="grid gap-600 pt-[60px]">
    <mds-tab>
      <mds-tab-item href="#section-1" selected>Section 1</mds-tab-item>
      <mds-tab-item href="#section-2" await={!tabContentLoaded}>Section 2</mds-tab-item>
      <mds-tab-item href="#section-3">Section 3</mds-tab-item>
      <SectionComponent id="section-1" slot="content" className="bg-label-amaranth-09 mt-400" title="Section 1"/>
      { tabContentLoaded && <SectionComponent id="section-2" slot="content" className="bg-label-blue-09 mt-400" title="Section 2"/> }
      <SectionComponent id="section-3" slot="content" className="bg-label-orange-09 mt-400" title="Section 3"/>
    </mds-tab>
  </div>
}

const TemplateOverflow = args =>
  <div class="grid gap-600 max-w-[480px]">
    <mds-tab {...args}>
      <mds-tab-item>First Blood</mds-tab-item>
      <mds-tab-item>Double Impact</mds-tab-item>
      <mds-tab-item selected>The Third Man</mds-tab-item>
      <mds-tab-item>The Fantastic Four</mds-tab-item>
      <mds-tab-item>The Fifth Element</mds-tab-item>
      <mds-tab-item>6 Underground</mds-tab-item>
      <mds-tab-item>Seven Samurai</mds-tab-item>
      <mds-tab-item>The Hateful Eight</mds-tab-item>
      <mds-tab-item>Nine Perfect Strangers</mds-tab-item>
      <mds-tab-item>10 Things I Hate About You</mds-tab-item>
    </mds-tab>
  </div>

const Template = args =>
  <div class="grid gap-600">
    <mds-tab {...args}>
      <mds-tab-item>
        First Blood
      </mds-tab-item>
      <mds-tab-item icon="mdi/alien" id="button" selected>
        Double Impact
      </mds-tab-item>
      <mds-tab-item>
        The Third Man
      </mds-tab-item>
      <div slot="content" class="gap-600 grid px-200 py-600 tablet:grid-cols-[1fr_2fr]">
        <mds-img class="rounded-lg" src='./movie-first-blood.jpg' />
        <div class="grid gap-100 auto-rows-min">
          <mds-text typography='h4'>First Blood</mds-text>
          <mds-text>
            Vietnam veteran and drifter John J. Rambo (Sylvester Stallone) wanders into a small Washington town in search of an old friend, but is met with intolerance and brutality by the local sheriff, Will Teasle (Brian Dennehy). When Teasle and his deputies restrain and shave Rambo, he flashes back to his time as a prisoner of war and unleashes his fury on the officers. He narrowly escapes the manhunt, but it will take his former commander (Richard Crenna) to save the hunters from the hunted.
          </mds-text>
        </div>
      </div>
      <div slot="content" class="py-600 px-200 grid tablet:grid-cols-[1fr_2fr] gap-600">
        <div class="auto-rows-min grid gap-200">
          <mds-img class="rounded-lg" src='./movie-double-impact.jpg' />
          <mds-img class="rounded-lg" src='./movie-double-impact-shot-01.jpg' />
          <mds-img class="rounded-lg" src='./movie-double-impact-shot-02.jpg' />
        </div>
        <div class="grid gap-100 auto-rows-min">
          <mds-text typography='h4'>Double Impact</mds-text>
          <mds-text>
            Nearly 25 years after seeing his father killed by Hong Kong crime boss Raymond Zhang (Philip Chan Yan Kin), Chad Wagner (Jean-Claude Van Damme) is living in Los Angeles as a flourishing yet peaceful martial arts trainer. But Chad has a twin brother, Alex (also Van Damme), who suddenly reunites with his less-aggressive sibling and wants to avenge their father's death. As the pair plan their payback against Zhang, they also struggle to overcome their personal differences.
          </mds-text>
        </div>
      </div>
      <div slot="content" class="py-600 px-200 grid tablet:grid-cols-[1fr_2fr] gap-600">
        <div class="auto-rows-min grid gap-200">
          <mds-img class="rounded-lg" src='./movie-the-third-man.jpg' />
          <mds-img class="rounded-lg" src='./movie-the-third-man-shot.jpg' />
        </div>
        <div class="grid gap-100 auto-rows-min">
          <mds-text typography='h4'>The Third Man</mds-text>
          <mds-text>
            Set in postwar Vienna, Austria, "The Third Man" stars Joseph Cotten as Holly Martins, a writer of pulp Westerns, who arrives penniless as a guest of his childhood chum Harry Lime (Orson Welles), only to find him dead. Martins develops a conspiracy theory after learning of a "third man" present at the time of Harry's death, running into interference from British officer Maj. Calloway (Trevor Howard) and falling head-over-heels for Harry's grief-stricken lover, Anna (Alida Valli).
          </mds-text>
        </div>
      </div>
    </mds-tab>
    <mds-hr />
    <div class="grid gap-100">
      <mds-text typography='h3'>Bottom content</mds-text>
      <mds-text>This content is outside the mds-tab component.</mds-text>
    </div>
  </div>

const TemplateNoSelected = args =>
  <div class="grid gap-600">
    <mds-tab {...args}>
      <mds-tab-item>
        First Blood
      </mds-tab-item>
      <mds-tab-item icon="mdi/alien" id="button">
        Double Impact
      </mds-tab-item>
      <mds-tab-item>
        The Third Man
      </mds-tab-item>
      <div slot="content" class="py-600 px-200 grid tablet:grid-cols-[1fr_2fr] gap-600">
        <mds-img class="rounded-lg" src='./movie-first-blood.jpg' />
        <div class="grid gap-100 auto-rows-min">
          <mds-text typography='h4'>First Blood</mds-text>
          <mds-text>
            Vietnam veteran and drifter John J. Rambo (Sylvester Stallone) wanders into a small Washington town in search of an old friend, but is met with intolerance and brutality by the local sheriff, Will Teasle (Brian Dennehy). When Teasle and his deputies restrain and shave Rambo, he flashes back to his time as a prisoner of war and unleashes his fury on the officers. He narrowly escapes the manhunt, but it will take his former commander (Richard Crenna) to save the hunters from the hunted.
          </mds-text>
        </div>
      </div>
      <div slot="content" class="py-600 px-200 grid tablet:grid-cols-[1fr_2fr] gap-600">
        <div class="auto-rows-min grid gap-200">
          <mds-img class="rounded-lg" src='./movie-double-impact.jpg' />
          <mds-img class="rounded-lg" src='./movie-double-impact-shot-01.jpg' />
          <mds-img class="rounded-lg" src='./movie-double-impact-shot-02.jpg' />
        </div>
        <div class="grid gap-100 auto-rows-min">
          <mds-text typography='h4'>Double Impact</mds-text>
          <mds-text>
            Nearly 25 years after seeing his father killed by Hong Kong crime boss Raymond Zhang (Philip Chan Yan Kin), Chad Wagner (Jean-Claude Van Damme) is living in Los Angeles as a flourishing yet peaceful martial arts trainer. But Chad has a twin brother, Alex (also Van Damme), who suddenly reunites with his less-aggressive sibling and wants to avenge their father's death. As the pair plan their payback against Zhang, they also struggle to overcome their personal differences.
          </mds-text>
        </div>
      </div>
      <div slot="content" class="py-600 px-200 grid tablet:grid-cols-[1fr_2fr] gap-600">
        <div class="auto-rows-min grid gap-200">
          <mds-img class="rounded-lg" src='./movie-the-third-man.jpg' />
          <mds-img class="rounded-lg" src='./movie-the-third-man-shot.jpg' />
        </div>
        <div class="grid gap-100 auto-rows-min">
          <mds-text typography='h4'>The Third Man</mds-text>
          <mds-text>
            Set in postwar Vienna, Austria, "The Third Man" stars Joseph Cotten as Holly Martins, a writer of pulp Westerns, who arrives penniless as a guest of his childhood chum Harry Lime (Orson Welles), only to find him dead. Martins develops a conspiracy theory after learning of a "third man" present at the time of Harry's death, running into interference from British officer Maj. Calloway (Trevor Howard) and falling head-over-heels for Harry's grief-stricken lover, Anna (Alida Valli).
          </mds-text>
        </div>
      </div>
    </mds-tab>
    <mds-hr />
    <div class="grid gap-100">
      <mds-text typography='h3'>Bottom content</mds-text>
      <mds-text>This content is outside the mds-tab component.</mds-text>
    </div>
  </div>

export const Default = Template.bind({})
export const Animation = Template.bind({})
Animation.args = {
  animation: 'slide',
}
export const Fill = Template.bind({})
Fill.args = {
  fill: true,
}
export const ManualTabContents = TemplateEmpty.bind({})
export const Overflow = TemplateOverflow.bind({})
Overflow.args = {
  overflow: true,
}
export const Scrollbar = TemplateOverflow.bind({})
Scrollbar.args = {
  scrollbar: true,
}
export const NoSelectedItem = TemplateNoSelected.bind({})
export const Scroll = TemplateScroll.bind({})

export const AsyncContent = TemplateAsyncContent.bind({})

