import { h } from '@stencil/core'

export default {
  title: 'UI / Tab',
}

const TemplateEmpty = args =>
  <div class="grid gap-6">
    <mds-tab {...args}>
      <mds-tab-item selected>First Blood</mds-tab-item>
      <mds-tab-item icon="mdi/alien" id="button">Double Impact</mds-tab-item>
      <mds-tab-item>The Third Man</mds-tab-item>
    </mds-tab>
    <mds-hr />
    <div class="grid gap-1">
      <mds-text typography='h3'>Bottom content</mds-text>
      <mds-text>This content is outside the mds-tab component.</mds-text>
    </div>
  </div>

const Template = args =>
  <div class="grid gap-6">
    <mds-tab {...args}>
      <mds-tab-item selected>
        First Blood
      </mds-tab-item>
      <mds-tab-item icon="mdi/alien" id="button">
        Double Impact
      </mds-tab-item>
      <mds-tab-item>
        The Third Man
      </mds-tab-item>
      <div slot="content" class="py-6 px-2 grid tablet:grid-cols-[1fr_2fr] gap-6">
        <mds-img class="rounded-lg" src='./movie-first-blood.jpg' />
        <div class="grid gap-1 auto-rows-min">
          <mds-text typography='h4'>First Blood</mds-text>
          <mds-text>
            Vietnam veteran and drifter John J. Rambo (Sylvester Stallone) wanders into a small Washington town in search of an old friend, but is met with intolerance and brutality by the local sheriff, Will Teasle (Brian Dennehy). When Teasle and his deputies restrain and shave Rambo, he flashes back to his time as a prisoner of war and unleashes his fury on the officers. He narrowly escapes the manhunt, but it will take his former commander (Richard Crenna) to save the hunters from the hunted.
          </mds-text>
        </div>
      </div>
      <div slot="content" class="py-6 px-2 grid tablet:grid-cols-[1fr_2fr] gap-6">
        <div class="auto-rows-min grid gap-2">
          <mds-img class="rounded-lg" src='./movie-double-impact.jpg' />
          <mds-img class="rounded-lg" src='./movie-double-impact-shot-01.jpg' />
          <mds-img class="rounded-lg" src='./movie-double-impact-shot-02.jpg' />
        </div>
        <div class="grid gap-1 auto-rows-min">
          <mds-text typography='h4'>Double Impact</mds-text>
          <mds-text>
            Nearly 25 years after seeing his father killed by Hong Kong crime boss Raymond Zhang (Philip Chan Yan Kin), Chad Wagner (Jean-Claude Van Damme) is living in Los Angeles as a flourishing yet peaceful martial arts trainer. But Chad has a twin brother, Alex (also Van Damme), who suddenly reunites with his less-aggressive sibling and wants to avenge their father's death. As the pair plan their payback against Zhang, they also struggle to overcome their personal differences.
          </mds-text>
        </div>
      </div>
      <div slot="content" class="py-6 px-2 grid tablet:grid-cols-[1fr_2fr] gap-6">
        <div class="auto-rows-min grid gap-2">
          <mds-img class="rounded-lg" src='./movie-the-third-man.jpg' />
          <mds-img class="rounded-lg" src='./movie-the-third-man-shot.jpg' />
        </div>
        <div class="grid gap-1 auto-rows-min">
          <mds-text typography='h4'>The Third Man</mds-text>
          <mds-text>
            Set in postwar Vienna, Austria, "The Third Man" stars Joseph Cotten as Holly Martins, a writer of pulp Westerns, who arrives penniless as a guest of his childhood chum Harry Lime (Orson Welles), only to find him dead. Martins develops a conspiracy theory after learning of a "third man" present at the time of Harry's death, running into interference from British officer Maj. Calloway (Trevor Howard) and falling head-over-heels for Harry's grief-stricken lover, Anna (Alida Valli).
          </mds-text>
        </div>
      </div>
    </mds-tab>
    <mds-hr />
    <div class="grid gap-1">
      <mds-text typography='h3'>Bottom content</mds-text>
      <mds-text>This content is outside the mds-tab component.</mds-text>
    </div>
  </div>

export const Default = Template.bind({})

export const ManualTabContents = TemplateEmpty.bind({})

