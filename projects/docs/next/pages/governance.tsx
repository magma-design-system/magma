import type { ReactElement } from 'react'
import Resources from '../fragments/resources'
import Separator from '../fragments/separator'
import ArticlePreview from '../fragments/article-preview'

const Headline = (): JSX.Element =>
  <section className="py-12">
    <div className="grid grid-cols-4 gap-6 auto-rows-fr items-end">
      <div className="grid col-span-2 gap-6">
        <div className='flex items-center justify-center'>
          <mds-img src="./magma-fake-logo.png" class="w-1/2"/>
        </div>
        <mds-text typography="h1">Maggioli Design System</mds-text>
        <mds-text typography="paragraph">Il Design System è un insieme di strumenti manutenuti da esperti di dominio variegati partendo dal management, marketing, design fino ad arrivare allo sviluppatore software, è fatto per condividere una unica linea di progettazione condivisa tra tutti i livelli e competenze aziendali.</mds-text>
      </div>
      <div className="grid auto-rows-min gap-4 self-start">
        <mds-text typography="h4" class="text-brand-maggioli-02">Filosofia</mds-text>
        <mds-text typography="paragraph">Tecnologia e conoscenza sono da sempre le nostre passioni, il nostro business e il modo con cui sia­mo riusciti a rispondere alle richieste di un mercato in continua evoluzione. Sono anche i pilastri su cui poggia la nostra mission: offrire servizi e prodotti di eccellenza alle organizzazioni pubbliche e private, in Italia e all’estero, per favorire l’innovazione tecnologica e di processo; coltivare e diffondere cultura, creatività e talento attraverso un team di risorse competenti e professionali.</mds-text>
        <div>
          <mds-button>Scopri la filosofia Maggioli</mds-button>
        </div>
      </div>
      <div className="grid auto-rows-min gap-4">
        <mds-text typography="h4" class="text-brand-maggioli-02">Magma</mds-text>
        <mds-text typography="paragraph">Il Maggioli Design System è un insieme di strumenti manutenuti da esperti di dominio variegati partendo dal management, marketing, design fino ad arrivare allo sviluppatore software, è fatto per condividere una unica linea di progettazione condivisa tra tutti i livelli e competenze aziendali.</mds-text>
        <div>
          <mds-button>Scopri Magma</mds-button>
        </div>
        <Resources className="mt-6"/>
      </div>
    </div>
  </section>

const News = (): JSX.Element =>
  <section className=" pb-12">
    <div className="grid grid-cols-4 gap-6 auto-rows-fr">
      <div className="grid col-span-2 gap-12 auto-rows-min">
        <Separator/>
        <div className="grid grid-cols-2 gap-6 auto-rows-min">
          <mds-text typography="h2">News</mds-text>
          <ArticlePreview/>
        </div>
      </div>
      <div className="grid gap-12 auto-rows-min">
        <Separator/>
        <ArticlePreview/>
      </div>
      <div className="grid gap-12 auto-rows-min">
        <Separator/>
        <ArticlePreview/>
      </div>
    </div>
  </section>

const Changelog = (): JSX.Element =>
  <div className="grid gap-12 auto-rows-min">
    <Separator/>
    <mds-text typography="h2">Changelog</mds-text>
  </div>

const RoadmapItem = (): JSX.Element =>
  <div className="flex gap-4 items-center">
    <mds-benchmark-bar value={96} class="flex-grow">Design language</mds-benchmark-bar>
    <mds-button size="sm" class="flex-shrink-0">Leggi</mds-button>
  </div>

const Roadmap = (): JSX.Element =>
  <div className="grid gap-12 auto-rows-min">
    <Separator/>
    <mds-text typography="h2">Roadmap</mds-text>
    <div className="grid gap-6">
      <RoadmapItem/>
      <RoadmapItem/>
      <RoadmapItem/>
    </div>
  </div>

const Governance = (): JSX.Element =>
  <div>
    <Headline/>
    <News/>
    <section className="pb-12 grid grid-cols-2 gap-6">
      <Roadmap/>
      <Changelog/>
    </section>
  </div>

export default Governance

import Layout from '../layouts/section'
import AsideMenu from '../layouts/fragments/aside/menu'
import ContentWrapper from '../layouts/fragments/content-wrapper'
import AsideButton from '../layouts/fragments/aside/button'

Governance.getLayout = (page: ReactElement) =>
  <Layout>
    <AsideMenu className="-mt-20 bg-adjust-tone-10">
      <AsideButton name="Components" opened>
        <AsideButton name="Button" selected/>
        <AsideButton name="Checkbox"/>
        <AsideButton name="Download"/>
      </AsideButton>
      <AsideButton name="Design Tokens"/>
      <AsideButton name="Accessibility"/>
      <AsideButton name="CSS"/>
    </AsideMenu>
    <ContentWrapper>
      { page }
    </ContentWrapper>
  </Layout>
