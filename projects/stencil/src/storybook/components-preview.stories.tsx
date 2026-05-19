import { h } from '@stencil/core'
import { ReactNode } from 'react'
// import { URLs } from '../components/mds-img/meta/storybook'

export default {
  title: 'Common tests / Component previews',
}

const Layout = ({ children }: { children?: ReactNode }) => (
  <div class="max-w-[480px] flex flex-wrap gap-400 p-600 outline-1 outline-offset-8 bg-tone-neutral">
    { children }
  </div>
)

const LayoutGrid = ({ children, className }: { children?: ReactNode, className?: string }) => (
  <div class={`max-w-[480px] grid gap-400 p-600 outline-1 outline-offset-8 bg-tone-neutral ${className}`}>
    { children }
  </div>
)

export const Banner = () => (
  <Layout>
    <mds-banner icon="mi/baseline/info" headline="This is a banner" variant="primary" tone="strong">
      <mds-text typography="detail">Magma is a design system with 90+ components, designed to
      help you build beautiful, high-quality products.</mds-text>
      <mds-button slot="action" label="Cancel" variant="dark" tone="outline"></mds-button>
      <mds-button slot="action" label="Confirm"></mds-button>
    </mds-banner>
  </Layout>
)

export const Accordion = () => (
  <Layout>
    <mds-accordion>
      <mds-accordion-item label="Accordion" selected>
        <mds-text>Magma has a full set of components to help you build beautiful, high-quality products. Accessibility is a first class citizen in this design system.</mds-text>
      </mds-accordion-item>
      <mds-accordion-item label="Scalable by design">
        <mds-text>Magma has a full set of components to help you build beautiful, high-quality products. Accessibility is a first class citizen in this design system.</mds-text>
      </mds-accordion-item>
      <mds-accordion-item label="Accessibility first">
        <mds-text>Magma has a full set of components to help you build beautiful, high-quality products. Accessibility is a first class citizen in this design system.</mds-text>
      </mds-accordion-item>
    </mds-accordion>
  </Layout>
)

export const AccordionTimer = () => (
  <Layout>
    <mds-accordion-timer>
      <mds-accordion-timer-item description="Accordion Timer">
        <mds-text>Magma has a full set of components to help you build beautiful, high-quality products. Accessibility is a first class citizen in this design system.</mds-text>
      </mds-accordion-timer-item>
      <mds-accordion-timer-item description="Scalable by design" selected>
        <mds-text>Magma has a full set of components to help you build beautiful, high-quality products. Accessibility is a first class citizen in this design system.</mds-text>
      </mds-accordion-timer-item>
      <mds-accordion-timer-item description="Future proof technology">
        <mds-text>Magma has a full set of components to help you build beautiful, high-quality products. Accessibility is a first class citizen in this design system.</mds-text>
      </mds-accordion-timer-item>
    </mds-accordion-timer>
  </Layout>
)

export const Author = () => (
  <Layout>
    <mds-author>
      <mds-avatar
        class="w-2000 bg-brand-maggioli-06"
        initials="eb"
        slot="avatar"
        src="./avatar-06-200x200.jpeg"
      />
      <mds-text typography="h6">
        Eric Bolton
      </mds-text>
      <mds-text typography="caption">
        Design System Architect
      </mds-text>
      <mds-text typography="caption">
        Author & Publisher
      </mds-text>
    </mds-author>
  </Layout>
)

export const Avatar = () => (
  <LayoutGrid className='grid-cols-5'>
    <mds-avatar class="w-full" initials="eb" src="./avatar-06-200x200.jpeg" />
    <mds-avatar class="w-full" initials="eb" />
    <mds-avatar class="w-full" initials="ab" tone="strong"/>
    <mds-avatar class="w-full" initials="cd" tone="strong"/>
    <mds-avatar class="w-full" initials="ef" tone="strong"/>
    <mds-avatar class="w-full" initials="gh" tone="weak"/>
    <mds-avatar class="w-full" initials="ij" tone="weak"/>
    <mds-avatar class="w-full" initials="kl" tone="weak"/>
    <mds-avatar class="w-full" initials="mn" tone="weak"/>
    <mds-avatar class="w-full" initials="op" tone="weak"/>
    <mds-avatar class="w-full" initials="qr" tone="weak"/>
    <mds-avatar class="w-full" initials="st" tone="weak"/>
    <mds-avatar class="w-full" initials="uv" tone="weak"/>
    <mds-avatar class="w-full" initials="wx" tone="weak"/>
    <mds-avatar class="w-full" initials="yz" tone="weak"/>
    <mds-avatar class="w-full" variant="info" />
    <mds-avatar class="w-full" variant="error" tone="weak" />
    <mds-avatar class="size-1600" variant="warning" tone="weak" />
    <mds-avatar class="size-1200" variant="success" tone="weak" />
    <mds-avatar class="size-800" variant="info" tone="weak" />
  </LayoutGrid>
)


export const AvatarStack = () => (
  <Layout>
    <mds-avatar-stack size="lg" total={36}>
      <mds-avatar-stack-item initials="mr" tone="weak" />
      <mds-avatar-stack-item initials="ks" tone="weak" />
      <mds-avatar-stack-item initials="mk" tone="weak" />
      <mds-avatar-stack-item initials="ac" tone="weak" />
      <mds-avatar-stack-item initials="er" tone="weak" />
      <mds-avatar-stack-item initials="jt" tone="weak" />
      <mds-avatar-stack-item initials="ps" tone="weak" />
      <mds-avatar-stack-item initials="tc" tone="weak" />
      <mds-avatar-stack-item initials="bb" tone="weak" />
      <mds-avatar-stack-item initials="mt" tone="weak" />
      <mds-avatar-stack-item initials="jm" tone="weak" />
      <mds-avatar-stack-item initials="jb" tone="weak" />
    </mds-avatar-stack>
    <mds-avatar-stack size="lg" total={36}>
      <mds-avatar-stack-item initials="jv" tone="weak" />
      <mds-avatar-stack-item initials="yr" tone="weak" />
      <mds-avatar-stack-item initials="ml" tone="weak" />
      <mds-avatar-stack-item initials="gr" tone="weak" />
      <mds-avatar-stack-item initials="ss" tone="weak" />
      <mds-avatar-stack-item initials="fl" tone="weak" />
      <mds-avatar-stack-item initials="we" tone="weak" />
      <mds-avatar-stack-item initials="mb" tone="weak" />
    </mds-avatar-stack>
    <mds-avatar-stack size="lg" total={36}>
      <mds-avatar-stack-item initials="tr" tone="weak" />
      <mds-avatar-stack-item initials="wd" tone="weak" />
      <mds-avatar-stack-item initials="ol" tone="weak" />
      <mds-avatar-stack-item initials="gh" tone="weak" />
      <mds-avatar-stack-item initials="op" tone="weak" />
      <mds-avatar-stack-item initials="mp" tone="weak" />
    </mds-avatar-stack>
    <mds-avatar-stack size="lg" total={36}>
      <mds-avatar-stack-item initials="al" tone="weak" />
      <mds-avatar-stack-item initials="dq" tone="weak" />
      <mds-avatar-stack-item initials="hl" tone="weak" />
      <mds-avatar-stack-item initials="sd" tone="weak" />
    </mds-avatar-stack>
  </Layout>
)

export const Badge = () => (
  <Layout>
    <mds-badge tone="weak">badge</mds-badge>
    <mds-badge variant="yellow" tone="strong">banana</mds-badge>
    <mds-badge variant="dark" tone="outline">cherry</mds-badge>
    <mds-badge variant="yellow" tone="weak">date</mds-badge>
    <mds-badge variant="amaranth" tone="strong">elderberry</mds-badge>
    <mds-badge variant="aqua" tone="outline">fig</mds-badge>
    <mds-badge variant="blue" tone="weak">grape</mds-badge>
    <mds-badge variant="dark" tone="strong">honeydew</mds-badge>
    <mds-badge variant="error" tone="outline">kiwi</mds-badge>
    <mds-badge variant="green" tone="weak">lemon</mds-badge>
    <mds-badge variant="info" tone="strong">mango</mds-badge>
    <mds-badge variant="lime" tone="outline">nectarine</mds-badge>
    <mds-badge variant="orange" tone="weak">orange</mds-badge>
    <mds-badge variant="purple" tone="strong">papaya</mds-badge>
    <mds-badge variant="red" tone="outline">quince</mds-badge>
    <mds-badge variant="sky" tone="weak">raspberry</mds-badge>
    <mds-badge variant="success" tone="strong">strawberry</mds-badge>
    <mds-badge variant="violet" tone="outline">tangerine</mds-badge>
    <mds-badge variant="warning" tone="weak">watermelon</mds-badge>
    <mds-badge variant="yellow" tone="strong">zucchini</mds-badge>
  </Layout>
)

export const BenchmarkBar = () => (
  <Layout>
    <mds-benchmark-bar class="w-full" value={30} alias='30%' variant="error">
      Not much
    </mds-benchmark-bar>
    <mds-benchmark-bar class="w-full" value={50} alias='50%'>
      Benchmark bar
    </mds-benchmark-bar>
    <mds-benchmark-bar class="w-full" value={60} alias='60%' variant="success">
      Too much
    </mds-benchmark-bar>
  </Layout>
)

export const Bibliography = () => (
  <Layout>
    <mds-bibliography
      author="Mario Rossi"
      date="2012-08-03"
      location="Milano"
      name="Grosso guaio a Chinatown"
      publisher="Decca Libri"
      url="https://www.maggioli.com"
    />
  </Layout>
)

export const Breadcrumb = () => (
  <Layout>
    <mds-breadcrumb>
      <mds-breadcrumb-item label="Breadcrumb" />
      <mds-breadcrumb-item label="is Here" />
      <mds-breadcrumb-item label="Let's just go" />
    </mds-breadcrumb>
  </Layout>
)

export const Button = () => (
  <Layout>
    <mds-button label="Hello world"></mds-button>
    <mds-button label="Magma Design System" variant="dark"></mds-button>
    <mds-button label="Library" variant="dark" tone="outline"></mds-button>
    <mds-button label="Magma" variant="light" tone="box" icon="mi/baseline/animation" class="pb-50"></mds-button>
    <mds-button label="Information" variant="info" tone="weak"></mds-button>
    <mds-button label="Design System" icon="mgg/ai-chatbot-outline" variant="ai" tone="weak"></mds-button>
    <mds-button label="Apple" variant="apple"></mds-button>
    <mds-button label="Go" variant="success" icon="mi/baseline/arrow-forward" icon-position="right"></mds-button>
    <mds-button label="Google" variant="google"></mds-button>
  </Layout>
)

export const ButtonDropdown = () => (
  <Layout>
    <mds-button-dropdown
      label="Button dropdown"
      tone="weak"
      variant="success"
    >
      <mds-button
        icon="mi/baseline/send"
        label="Invia subito"
        tone="text"
        variant="dark"
      />
      <mds-button
        icon="mi/baseline/delete"
        label="Elimina"
        tone="text"
        variant="dark"
      />
    </mds-button-dropdown>
    <mds-button-dropdown
      label="Checkout item information"
      tone="weak"
      variant="info"
    >
      <mds-button
        icon="mi/baseline/send"
        label="Invia subito"
        tone="text"
        variant="dark"
      />
      <mds-button
        icon="mi/baseline/delete"
        label="Elimina"
        tone="text"
        variant="dark"
      />
    </mds-button-dropdown>
    <mds-button-dropdown
      label="Continue"
      tone="strong"
      variant="dark"
    >
      <mds-button
        icon="mi/baseline/send"
        label="Invia subito"
        tone="text"
        variant="dark"
      />
      <mds-button
        icon="mi/baseline/delete"
        label="Elimina"
        tone="text"
        variant="dark"
      />
    </mds-button-dropdown>
    <mds-button-dropdown
      label="Avoid sugar"
      tone="weak"
      variant="dark"
    >
      <mds-button
        icon="mi/baseline/send"
        label="Invia subito"
        tone="text"
        variant="dark"
      />
      <mds-button
        icon="mi/baseline/delete"
        label="Elimina"
        tone="text"
        variant="dark"
      />
    </mds-button-dropdown>
    <mds-button-dropdown
      label="You are warned"
      tone="weak"
      variant="warning"
    >
      <mds-button
        icon="mi/baseline/send"
        label="Invia subito"
        tone="text"
        variant="dark"
      />
      <mds-button
        icon="mi/baseline/delete"
        label="Elimina"
        tone="text"
        variant="dark"
      />
    </mds-button-dropdown>
    <mds-button-dropdown
      label="Errors found"
      tone="weak"
      variant="error"
    >
      <mds-button
        icon="mi/baseline/send"
        label="Invia subito"
        tone="text"
        variant="dark"
      />
      <mds-button
        icon="mi/baseline/delete"
        label="Elimina"
        tone="text"
        variant="dark"
      />
    </mds-button-dropdown>
  </Layout>
)

export const ButtonGroup = () => (
  <Layout>
    <mds-button-group>
      <mds-button icon="mi/baseline/text-format" tone="text" variant="dark" />
      <mds-button icon="mi/baseline/format-list-numbered" tone="text" variant="dark" />
      <mds-button icon="mi/baseline/text-rotate-up" tone="text" variant="dark" />
      <mds-button icon="mi/baseline/wrap-text" tone="text" variant="dark" />
      <mds-button icon="mi/baseline/border-color" tone="text" variant="dark" />
      <mds-button icon="mi/baseline/format-italic" tone="text" variant="dark" />
      <mds-button icon="mi/baseline/format-color-fill" tone="text" variant="dark" />
      <mds-button icon="mi/baseline/format-bold" tone="text" variant="dark" />
    </mds-button-group>
  </Layout>
)

export const Calendar = () => (
  <Layout>
    <mds-calendar end-date="2025-03-24" start-date="2025-03-18" class="w-full" />
  </Layout>
)

export const Card = () => (
  <Layout>
    <mds-card class="w-full">
      <mds-card-header>
        <div class="flex gap-400 items-center min-w-0">
          <mds-avatar
            class="w-1100 min-w-1100 shrink-0"
            initials="md"
          ></mds-avatar>
          <div class="flex gap-0 flex-col grow min-w-0">
            <mds-text typography="h6" truncate="word">
              Magma Design System
            </mds-text>
            <mds-text typography="caption" truncate="word">
              Card component
            </mds-text>
          </div>
        </div>
        <mds-button
          class="shrink-0"
          id="action-example"
          icon="mi/round/more-vert"
          variant="dark"
          tone="text"
        ></mds-button>
      </mds-card-header>
      <mds-card-media>
        <mds-img src="./video-preview-01.webp" class="object-cover"></mds-img>
      </mds-card-media>
      <mds-card-content>
        <mds-text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin quis
          elementum lorem. Phasellus vel quam leo. Ut eget finibus libero. Integer
          sed odio hendrerit diam maximus blandit ac malesuada odio.
        </mds-text>
      </mds-card-content>
      <mds-card-footer>
        <mds-button variant="dark" tone="text">
          Cancel
        </mds-button>
        <mds-button variant="dark">Contact</mds-button>
      </mds-card-footer>
    </mds-card>
  </Layout>
)

export const Chip = () => (
  <Layout>
    <mds-chip icon="mi/baseline/widgets" label="Chip component" variant="ai"></mds-chip>
    <mds-chip icon="mi/baseline/arrow-forward" label="Go forward" tone="weak"></mds-chip>
    <mds-chip icon="mi/baseline/ac-unit" label="Cold" variant="info" tone="weak"></mds-chip>
    <mds-chip icon="mi/baseline/grass" label="Grass" variant="green" tone="weak"></mds-chip>
    <mds-chip icon="mi/baseline/pets" label="Dog" variant="warning" tone="strong"></mds-chip>
    <mds-chip icon="mi/baseline/sports-bar" label="Go drink something" variant="warning" tone="weak"></mds-chip>
    <mds-chip icon="mi/baseline/desk" label="Desk" variant="info" tone="weak"></mds-chip>
    <mds-chip icon="mi/baseline/family-restroom" label="Family" variant="orchid" tone="weak"></mds-chip>
    <mds-chip icon="mi/outline/light" label="Light" variant="orange" tone="weak"></mds-chip>
    <mds-chip icon="mi/baseline/headphones" label="Hear music" variant="blue" tone="strong"></mds-chip>
    <mds-chip icon="mi/baseline/play-arrow" label="Removable item" variant="lime" tone="weak" deletable></mds-chip>
  </Layout>
)

export const Details = () => (
  <Layout>
    <mds-details opened>
      <mds-icon name="mi/baseline/check-circle" slot="icon" />
      <mds-text slot="title" typography="h6">Details</mds-text>
      <mds-text typography="detail">
        This component is used to display additional information in a collapsible section.
      </mds-text>
      <mds-button size="sm" slot="action" tone="weak">
        Go to content
      </mds-button>
    </mds-details>
    <mds-details>
      <mds-icon name="mgg/ai-chatbot" slot="icon" />
      <mds-text slot="title" typography="h6">Chatbot</mds-text>
      <mds-text typography="detail">
        This component is used to display additional information in a collapsible section.
      </mds-text>
      <mds-button size="sm" slot="action">
        Go to content
      </mds-button>
    </mds-details>
    <mds-details>
      <mds-icon name="mi/baseline/park" slot="icon" />
      <mds-text slot="title" typography="h6">Tree</mds-text>
      <mds-text typography="detail">
        This component is used to display additional information in a collapsible section.
      </mds-text>
      <mds-button size="sm" slot="action">
        Go to content
      </mds-button>
    </mds-details>
  </Layout>
)

export const Dropdown = () => (
  <Layout>
    <div class="flex items-start justify-center h-[300px] w-full">
      <mds-button id="my-dropdown">
        Show Fred
      </mds-button>
      <mds-dropdown
        class="max-w-[350px] w-full"
        target="#my-dropdown"
      >
        <mds-author class="text-tone-neutral-04">
          <mds-avatar
            aria-describedby="A protrait of Frederick Phillips Brooks Jr."
            class="w-2000 bg-brand-maggioli-06"
            initials="fb"
            slot="avatar"
            src="./fred-brooks-zoom.webp"
          />
          <mds-text
            class="text-tone-neutral-02"
            typography="h6"
          >
            Fred Brooks
          </mds-text>
          <mds-text typography="caption">
            Software engineer
          </mds-text>
          <mds-text typography="caption">
            IT
          </mds-text>
        </mds-author>
        <mds-text
          class="text-tone-neutral-04"
          typography="detail"
        >
          Frederick Phillips "Fred" Brooks Jr. (born April 19, 1931) is an American computer architect, software engineer, and computer scientist.
        </mds-text>
      </mds-dropdown>
    </div>
  </Layout>
)

export const Entity = () => (
  <Layout>
    <mds-entity aria-label="Luogo" initials="EC" class="w-full">
      <mds-text truncate="word" typography="h6" title="Nome">Entity</mds-text>
      <mds-text truncate="word" title="Strada" slot="detail" typography="caption">Component</mds-text>
      <mds-button slot="action" icon="mdi/map-marker" variant="primary" tone="strong" title="Go to Google Maps"/>
    </mds-entity>

    <mds-entity aria-label="Personaggio" src="./example-avatar-02.png" class="w-full">
      <mds-text aria-label="Nome" role="text" truncate="word" typography="h6">Mike Wazowski</mds-text>
      <mds-badge aria-label="Carattere" role="text" slot="detail" tone="weak" variant="orange">buono</mds-badge>
      <mds-text aria-label="Email" role="text" slot="detail" truncate="word" typography="caption">mike@wazowski.com</mds-text>
      <mds-button icon="mdi/replay" onClick={() => {}} slot="action" title="Restore" tone="strong" variant="primary"/>
      <mds-button icon="mdi/delete" onClick={() => {}} slot="action" title="Delete" tone="strong" variant="error"/>
    </mds-entity>

    <mds-entity aria-label="File" await icon="mi/baseline/remove-circle" tone="weak" variant="warning" class="w-full">
      <mds-text aria-label="Nome" truncate="word" typography="h6">Report_2016_2017.docx</mds-text>
      <mds-text aria-label="Stato caricamento" slot="detail" truncate="word" typography="caption">Uploading...</mds-text>
      <mds-button icon="mi/baseline/cancel" onClick={() => {}} slot="action" title="Annulla upload" variant="light"/>
    </mds-entity>
  </Layout>
)

export const File = () => (
  <Layout>
    <mds-file filename="CV_Rossi.pdf" />
    <mds-file filename="Vector Image.svg" />
    <mds-file filename="Report_2016_2017.docx" />
    <mds-file filename="Presentation slide.ppt" />
    <mds-file filename="Spreadsheet.xlsx" />
    <mds-file filename="data.json" />
    <mds-file filename="audio file.mp3" />
  </Layout>
)

export const FilePreview = () => (
  <LayoutGrid className='grid-cols-2'>
    <mds-file-preview filename="audio file.mp3" filesize="10248594" />
    <mds-file-preview filename="CV_Rossi.pdf" filesize="6475532" />
    <mds-file-preview filename="Vector Image.svg" filesize="248594" />
  </LayoutGrid>
)

export const Header = () => (
  <Layout>
    <mds-header class="relative w-full" appearance="inline" nav="none" menu="all">
      <mds-header-bar class="relative">
        <div class="flex gap-400 items-center">
          <mds-img class="w-1000" src="/logo-gruppo-maggioli.svg" />
          <div class="mb-100 grid grid-cols-full gap-100">
            <mds-text typography="h5">Header bar</mds-text>
            <mds-text typography="option" class="text-tone-neutral-04">
              One of the finest headers you'll ever see
            </mds-text>
          </div>
        </div>
        <mds-button slot="nav" variant="dark" tone="outline">
          Accedi
        </mds-button>
        <mds-button slot="nav" icon="mi/round/person">
          Registrati
        </mds-button>
      </mds-header-bar>
      <div slot="menu">
        <div class="flex gap-200 items-center p-600 border-b border-tone-neutral-09">
          <mds-img class="w-1000" src="/logo-gruppo-maggioli.svg" />
          <div class="mb-100">
            <mds-text typography="h6">Gruppo Maggioli</mds-text>
            <mds-text typography="option" class="text-tone-neutral-04">
              Header by RD Team
            </mds-text>
          </div>
        </div>
        <div class="grid gap-200 p-600">
          <mds-button variant="dark" tone="outline">
            Accedi
          </mds-button>
          <mds-button icon="mi/round/person">Registrati</mds-button>
        </div>
      </div>
    </mds-header>
  </Layout>
)

export const Keyboard = () => (
  <Layout>
    <mds-keyboard>
      <mds-keyboard-key name="command"></mds-keyboard-key>
      <mds-keyboard-key name="shift"></mds-keyboard-key>
      <mds-keyboard-key name="s"></mds-keyboard-key>
    </mds-keyboard>
    <mds-keyboard>
      <mds-keyboard-key name="command"></mds-keyboard-key>
      <mds-keyboard-key name="shift"></mds-keyboard-key>
      <mds-keyboard-key name="d"></mds-keyboard-key>
    </mds-keyboard>
    <mds-keyboard try>
      <mds-keyboard-key name="command"></mds-keyboard-key>
      <mds-keyboard-key name="x"></mds-keyboard-key>
    </mds-keyboard>
    <mds-keyboard>
      <mds-keyboard-key name="windows"></mds-keyboard-key>
      <mds-keyboard-key name="x"></mds-keyboard-key>
    </mds-keyboard>
  </Layout>
)

export const Label = () => (
  <Layout>
    <mds-label label="Amaranth" variant="amaranth"></mds-label>
    <mds-label label="Orchid" variant="orchid"></mds-label>
    <mds-label label="Purple" variant="purple"></mds-label>
    <mds-label label="Violet" variant="violet"></mds-label>
    <mds-label label="Blue" variant="blue"></mds-label>
    <mds-label label="Sky" variant="sky"></mds-label>
    <mds-label label="Aqua" variant="aqua"></mds-label>
    <mds-label label="Green" variant="green"></mds-label>
    <mds-label label="Lime" variant="lime"></mds-label>
    <mds-label label="Yellow" variant="yellow"></mds-label>
    <mds-label label="Orange" variant="orange"></mds-label>
  </Layout>
)

export const List = () => (
  <Layout>
    <mds-list>
      <mds-list-item>This is a list item, the first element, which can be as long as you want</mds-list-item>
      <mds-list-item>Then, this is the second element in the list</mds-list-item>
      <mds-list-item>And finally, this is the third element in the list</mds-list-item>
    </mds-list>
  </Layout>
)

export const Mention = () => (
  <Layout>
    <mds-text>
      Hello <mds-mention label="mario.rossi"></mds-mention>, are you ready to be mentioned with this fantastic and incredible component?
    </mds-text>
  </Layout>
)

export const Note = () => (
  <Layout>
    <mds-note>
      What one programmer can do in one month, two programmers can do in two months. That's what Fred Brooks said.
    </mds-note>
  </Layout>
)

export const Paginator = () => (
  <Layout>
    <mds-paginator class="min-w-0" pages={32} />
  </Layout>
)

export const Preference = () => (
  <Layout>
    <mds-pref class="w-full">
      <mds-pref-theme />
      <mds-pref-contrast />
      <mds-pref-animation />
      <mds-pref-consumption />
    </mds-pref>
  </Layout>
)
