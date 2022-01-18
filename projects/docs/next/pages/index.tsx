import type { ReactElement } from 'react'
import Layout from '../fragments/layouts/homepage'
import Resources from '../fragments/resources'
import Separator from '../fragments/separator'
// import Card from '../fragments/card'
import { ReleasePreview, ReleaseCommit } from '../fragments/release'
import ArticlePreview from '../fragments/article-preview'

const Headline = (): JSX.Element =>
  <section className="py-12">
    <div className="grid desktop:grid-cols-4 tablet:grid-cols-2 grid-cols-1 desktop:gap-6 gap-12 desktop:auto-rows-fr desktop:items-end">
      <div className="grid tablet:col-span-2 gap-6 self-stretch grid-rows-[1fr_auto_auto]">
        <div className="flex items-center justify-center self-stretch">
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
    <div className="grid desktop:grid-cols-4 gap-6 desktop:auto-rows-fr">
      <div className="grid tablet:col-span-2 gap-12 auto-rows-min">
        <Separator/>
        <div className="grid desktop:grid-cols-2 gap-6 auto-rows-min">
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

const Releases = (): JSX.Element =>
  <div className="grid gap-12 auto-rows-min">
    <Separator/>
    <mds-text typography="h2">Rilasci</mds-text>
    <div className="grid gap-4">
      <ReleasePreview name="mds-text" date="2022-01-12" version="1.0.3" commits={32}>
        <ReleaseCommit category="fix" message="Add typography property to prevent stuff to work bad and be depressed, so please understand me"/>
        <ReleaseCommit category="style" message="Change default text color"/>
        <ReleaseCommit category="refact" message="Move variants into separated file"/>
      </ReleasePreview>
      <ReleasePreview name="mds-icon" date="2022-01-06" version="2.0.3" commits={7}>
        <ReleaseCommit category="change" message="Change default text color"/>
        <ReleaseCommit category="feat" message="Add typography property"/>
        <ReleaseCommit category="refact" message="Move variants into separated file"/>
      </ReleasePreview>
      <ReleasePreview name="icons" date="2022-01-04" version="1.4.7" commits={14}>
        <ReleaseCommit category="style" message="Change default text color"/>
        <ReleaseCommit category="refact" message="Move variants into separated file"/>
        <ReleaseCommit category="fix" message="Add typography property"/>
      </ReleasePreview>
    </div>
  </div>

const RoadmapItem = (): JSX.Element =>
  <div className="flex gap-4 items-center">
    <mds-benchmark-bar value={96} class="flex-grow" variant="primary">Design language</mds-benchmark-bar>
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
      <RoadmapItem/>
      <RoadmapItem/>
      <RoadmapItem/>
      <RoadmapItem/>
    </div>
  </div>

const Home = (): JSX.Element =>
  <div>
    <Headline/>
    <News/>
    <section className="pb-12 grid tablet:grid-cols-2 gap-6">
      <Roadmap/>
      <Releases/>
    </section>
  </div>

export default Home

Home.getLayout = (page: ReactElement) =>
  <Layout>
    { page }
  </Layout>
