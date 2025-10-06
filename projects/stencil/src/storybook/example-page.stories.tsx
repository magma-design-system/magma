import { h } from '@stencil/core'

export default {
  title: 'Common tests',
}

const Template = () => (
  <div class="-m-600">
    <div class="bg-label-amaranth-06 text-tone-neutral flex text-center items-center justify-center h-dvh min-h-[500px] flex-col select-none">
      <mds-text typography="h1">Hey</mds-text>
      <mds-text typography="h1">WelcomeTo</mds-text>
      <mds-text typography="h1">ThisBeautiful</mds-text>
      <mds-text typography="h1">AndIncrediblyNice</mds-text>
      <mds-text typography="h1">FakeLandingPage</mds-text>
      <mds-text typography="h1">PleaseEnjoy</mds-text>
      <mds-text typography="h1">WithJoy</mds-text>
      <mds-text typography="h1">Bye</mds-text>
    </div>
    <div class="p-1200 flex justify-center">
      <div class="grid gap-600 desktop:grid-cols-3 tablet:grid-cols-2 max-w-screen-desktop">
        {Array(18)
          .fill(null)
          .map(() => (
            <div class="grid gap-25">
              <mds-text typography="h5" tag="h2">
                This is a section title
              </mds-text>
              <mds-text>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Accusamus iure, ratione beatae quam optio cumque rerum modi
                consectetur odit eligendi omnis veniam fuga non ipsam voluptatum
                a ut neque illum.
              </mds-text>
            </div>
          ))}
      </div>
    </div>
  </div>
)

export const ExamplePage = {
  render: Template,
}
