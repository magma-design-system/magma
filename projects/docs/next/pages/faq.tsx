import type { ReactElement } from 'react'
import Header from '../fragments/article/header'
import Menu from '../fragments/article/menu'
import Authors from '../fragments/article/authors'

const Faq = (): JSX.Element =>
  <div>
    <Header title="FAQ"/>
    <Menu>
      <mds-tab-item>Condotta</mds-tab-item>
      <mds-tab-item>Commit</mds-tab-item>
      <mds-tab-item>Submission</mds-tab-item>
      <mds-tab-item>Versionamento</mds-tab-item>
    </Menu>
    <article className="py-12 grid gap-12 text-adjust-tone-01">
      <mds-accordion>
        <mds-accordion-item description="In che modo è possibile contribuire al Design System?">
          <mds-text class="columns-xs gap-x-6">
            Blipbug presenta delle fattezze riconducibili agli insetti nello stadio pre-crisalide. Il suo corpo si sviluppa in lunghezza, ed è formato principalmente da tre parti: la sua grande testa, il suo collo (molto simile ad un collare), e il corpo vero e proprio. La prima di queste è suddivisa in una parte color crema e una parte color denim; dello stesso colore sono le appenidici a forma di che si trovano sopra e ai lati della testa. I suoi occhi sono enormi e grigi, ed hanno delle sottilissime sopracciglia sopra di essi. Il suo collare, anch_esso color denim, presenta delle setole giallo sabbia, con le quali percepisce i segnali esterni: stesso colore si presenta nel segmento centrale della sua parte inferiore, dove sono presenti un primo paio di zampe crema. Il segmento superiore del corpo è bianco e ospita delle zampe anteriori color crema, ed infine, la parte finale, o la coda, è color denim e finisce con un_appendice a un po_ piú grossa.
          </mds-text>
        </mds-accordion-item>
        <mds-accordion-item description="Se ho un problema dove posso scrivere?">
          <mds-text class="columns-xs gap-x-6">
            Blipbug presenta delle fattezze riconducibili agli insetti nello stadio pre-crisalide. Il suo corpo si sviluppa in lunghezza, ed è formato principalmente da tre parti: la sua grande testa, il suo collo (molto simile ad un collare), e il corpo vero e proprio. La prima di queste è suddivisa in una parte color crema e una parte color denim; dello stesso colore sono le appenidici a forma di che si trovano sopra e ai lati della testa. I suoi occhi sono enormi e grigi, ed hanno delle sottilissime sopracciglia sopra di essi. Il suo collare, anch_esso color denim, presenta delle setole giallo sabbia, con le quali percepisce i segnali esterni: stesso colore si presenta nel segmento centrale della sua parte inferiore, dove sono presenti un primo paio di zampe crema. Il segmento superiore del corpo è bianco e ospita delle zampe anteriori color crema, ed infine, la parte finale, o la coda, è color denim e finisce con un_appendice a un po_ piú grossa.
          </mds-text>
          <div className="flex flex-wrap gap-6">
            <mds-button>StackOverflow</mds-button>
            <mds-button>Contatto email</mds-button>
            <mds-button>Google Chat</mds-button>
          </div>
        </mds-accordion-item>
        <mds-accordion-item description="L'uso del Design System è obbligatorio?">
          <mds-text class="columns-xs gap-x-6">
            Blipbug presenta delle fattezze riconducibili agli insetti nello stadio pre-crisalide. Il suo corpo si sviluppa in lunghezza, ed è formato principalmente da tre parti: la sua grande testa, il suo collo (molto simile ad un collare), e il corpo vero e proprio. La prima di queste è suddivisa in una parte color crema e una parte color denim; dello stesso colore sono le appenidici a forma di che si trovano sopra e ai lati della testa. I suoi occhi sono enormi e grigi, ed hanno delle sottilissime sopracciglia sopra di essi. Il suo collare, anch_esso color denim, presenta delle setole giallo sabbia, con le quali percepisce i segnali esterni: stesso colore si presenta nel segmento centrale della sua parte inferiore, dove sono presenti un primo paio di zampe crema. Il segmento superiore del corpo è bianco e ospita delle zampe anteriori color crema, ed infine, la parte finale, o la coda, è color denim e finisce con un_appendice a un po_ piú grossa.
          </mds-text>
        </mds-accordion-item>
        <mds-accordion-item description="È tutta colpa di Mauro?">
          <mds-text class="columns-xs gap-x-6">
            Blipbug presenta delle fattezze riconducibili agli insetti nello stadio pre-crisalide. Il suo corpo si sviluppa in lunghezza, ed è formato principalmente da tre parti: la sua grande testa, il suo collo (molto simile ad un collare), e il corpo vero e proprio. La prima di queste è suddivisa in una parte color crema e una parte color denim; dello stesso colore sono le appenidici a forma di che si trovano sopra e ai lati della testa. I suoi occhi sono enormi e grigi, ed hanno delle sottilissime sopracciglia sopra di essi. Il suo collare, anch_esso color denim, presenta delle setole giallo sabbia, con le quali percepisce i segnali esterni: stesso colore si presenta nel segmento centrale della sua parte inferiore, dove sono presenti un primo paio di zampe crema. Il segmento superiore del corpo è bianco e ospita delle zampe anteriori color crema, ed infine, la parte finale, o la coda, è color denim e finisce con un_appendice a un po_ piú grossa.
          </mds-text>
        </mds-accordion-item>
      </mds-accordion>
      <footer>
        <Authors/>
      </footer>
    </article>
  </div>

export default Faq

import Layout from '../fragments/layouts/section'
import AsideMenu from '../fragments/layouts/fragments/aside/menu'
import ContentWrapper from '../fragments/layouts/fragments/content-wrapper'
import AsideButton from '../fragments/layouts/fragments/aside/button'

Faq.getLayout = (page: ReactElement) =>
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
