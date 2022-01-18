import type { ReactElement, FC } from 'react'
import Header from '../fragments/article/header'
import Menu from '../fragments/article/menu'
import ArticleRelatedLinks from '../fragments/article/related-links'
import ArticleRelatedContent from '../fragments/article/related-content'
import ArticleKeyPoints, { ArticleKeyPoint } from '../fragments/article/key-points'
import Authors from '../fragments/article/authors'
import Bibliography from '../fragments/article/bibliography'
import ArticlePreview from '../fragments/article-preview'
import DesignPrinciple from '../fragments/design-principle'
import { ArticleSeparator } from '../fragments/separator'
import { Roadmap, RoadmapItem } from '../fragments/roadmap'
import { Release, ReleaseCommit } from '../fragments/release'
import { ArticleWidgetContents, ArticleWidgetAside, ArticleWidget } from '../fragments/article/widget'

const articleTitle = 'Article cheatsheet'

const CompanyValues = (): JSX.Element =>
  <div>
    <Header title={articleTitle}/>
    <Menu>
      <mds-tab-item>Condotta</mds-tab-item>
      <mds-tab-item>Commit</mds-tab-item>
      <mds-tab-item>Submission</mds-tab-item>
      <mds-tab-item>Voce ulteriore</mds-tab-item>
      <mds-tab-item>Versionamento</mds-tab-item>
      <mds-tab-item>SwissTransfer</mds-tab-item>
    </Menu>
    <article className="py-12 grid gap-12 text-adjust-tone-01">
      <div className='-mt-12'>
        <DesignPrinciple title="Unified" description="Each piece is part of a greater whole and should contribute positively to the system at scale. There should be no isolated features or outliers."/>
        <DesignPrinciple title="Universal" description="Airbnb is used around the world by a wide global community. Our products and visual language should be welcoming and accessible."/>
        <DesignPrinciple title="Iconic" description="We’re focused when it comes to both design and functionality. Our work should speak boldly and clearly to this focus."/>
        <DesignPrinciple title="Conversational" description="Our use of motion breathes life into our products, and allows us to communicate with users in easily understood ways."/>
      </div>
      <ArticleWidget>
        <ArticleWidgetContents>
          <mds-text typography="h3" class="text-brand-maggioli-02 max-w-title">Contenuto markdown a paragrafi</mds-text>
          <mds-text typography="paragraph" class="max-w-text">Da oltre 115 anni siamo una Family Company che da ben quattro generazioni ama definirsi usando l’espressione “innovatori per tradizione”: un’espressione che racchiude il nostro spirito imprenditoriale e ben interpreta i principi ed i valori alla base della nostra cultura d&apos;impresa.</mds-text>
          <mds-text typography="paragraph" class="max-w-text">Nel nostro percorso abbiamo reso la <a href="#">Responsabilità Sociale d’Impresa</a> il nostro modo unico e distintivo di essere e fare impresa, dentro e fuori. Creare valore condiviso nel breve, medio, e soprattutto nel lungo termine, è la bussola con cui ci orientiamo - giorno dopo giorno - nel costruire relazioni di crescita e di fiducia reciproche con tutti gli stakeholder. In un’ottica di miglioramento continuo ci prendiamo cura dei collaboratori, così come dei fornitori, dei clienti, dei territori in cui operiamo e delle comunità con cui interagiamo, consapevoli dell’impatto sociale ed ambientale delle nostre azioni.</mds-text>
          <mds-img src="./indian-boy.jpeg" class="rounded-xl text-secondary-paragraph max-w-text"/>
        </ArticleWidgetContents>
        <ArticleWidgetAside>
          <ArticleRelatedLinks title="Contenuti correlati">
            <mds-list-item><mds-text><a href="#">Hello world</a></mds-text></mds-list-item>
            <mds-list-item><mds-text><a href="#">Il contributo di un web-component se usato male</a></mds-text></mds-list-item>
            <mds-list-item><mds-text><a href="#">Antani alla brematurata</a></mds-text></mds-list-item>
          </ArticleRelatedLinks>
        </ArticleWidgetAside>
      </ArticleWidget>
      <ArticleWidget>
        <ArticleWidgetContents>
          <mds-text typography="h3" class="text-brand-maggioli-02 max-w-title">Contenuto markdown a paragrafi</mds-text>
          <mds-text typography="paragraph" class="max-w-text">Da oltre 115 anni siamo una Family Company che da ben quattro generazioni ama definirsi usando l’espressione “innovatori per tradizione”: un’espressione che racchiude il nostro spirito imprenditoriale e ben interpreta i principi ed i valori alla base della nostra cultura d&apos;impresa.</mds-text>
          <mds-list>
            <mds-list-item><mds-text typography="paragraph" class="max-w-text">Nel nostro percorso abbiamo reso la <a href="#">Responsabilità Sociale d’Impresa</a> il nostro modo unico e distintivo di essere e fare impresa, dentro e fuori. Creare valore condiviso nel breve, medio, e soprattutto nel lungo termine, è la bussola con cui ci orientiamo - giorno dopo giorno - nel costruire relazioni di crescita e di fiducia reciproche con tutti gli stakeholder. In un’ottica di miglioramento continuo ci prendiamo cura dei collaboratori, così come dei fornitori, dei clienti, dei territori in cui operiamo e delle comunità con cui interagiamo, consapevoli dell’impatto sociale ed ambientale delle nostre azioni.</mds-text></mds-list-item>
            <mds-list-item><mds-text typography="paragraph" class="max-w-text">Nel nostro percorso abbiamo reso la <a href="#">Responsabilità Sociale d’Impresa</a> il nostro modo unico e distintivo di essere e fare impresa, dentro e fuori. Creare valore condiviso nel breve, medio, e soprattutto nel lungo termine, è la bussola con cui ci orientiamo - giorno dopo giorno - nel costruire relazioni di crescita e di fiducia reciproche con tutti gli stakeholder. In un’ottica di miglioramento continuo ci prendiamo cura dei collaboratori, così come dei fornitori, dei clienti, dei territori in cui operiamo e delle comunità con cui interagiamo, consapevoli dell’impatto sociale ed ambientale delle nostre azioni.</mds-text></mds-list-item>
            <mds-list-item><mds-text typography="paragraph" class="max-w-text">Nel nostro percorso abbiamo reso la <a href="#">Responsabilità Sociale d’Impresa</a> il nostro modo unico e distintivo di essere e fare impresa, dentro e fuori. Creare valore condiviso nel breve, medio, e soprattutto nel lungo termine, è la bussola con cui ci orientiamo - giorno dopo giorno - nel costruire relazioni di crescita e di fiducia reciproche con tutti gli stakeholder. In un’ottica di miglioramento continuo ci prendiamo cura dei collaboratori, così come dei fornitori, dei clienti, dei territori in cui operiamo e delle comunità con cui interagiamo, consapevoli dell’impatto sociale ed ambientale delle nostre azioni.</mds-text></mds-list-item>
          </mds-list>
        </ArticleWidgetContents>
        <ArticleWidgetAside>
          <ArticleRelatedContent title="Perché UX e UI sono così cool?">
            <mds-text typography="caption" class="max-w-text">Da oltre 115 anni siamo una Family Company che da ben quattro generazioni ama definirsi usando l’espressione “innovatori per tradizione”: un’espressione che racchiude il nostro spirito imprenditoriale e ben interpreta i principi ed i valori alla base della nostra cultura d&apos;impresa.</mds-text>
          </ArticleRelatedContent>
        </ArticleWidgetAside>
      </ArticleWidget>
      <ArticleWidget>
        <ArticleWidgetContents>
          <mds-text typography="h3" class="text-brand-maggioli-02 max-w-title">Contenuto markdown a paragrafi</mds-text>
          <mds-text typography="paragraph" class="max-w-text">Nel nostro percorso abbiamo reso la <a href="#">Responsabilità Sociale d’Impresa</a> il nostro modo unico e distintivo di essere e fare impresa, dentro e fuori. Creare valore condiviso nel breve, medio, e soprattutto nel lungo termine, è la bussola con cui ci orientiamo - giorno dopo giorno - nel costruire relazioni di crescita e di fiducia reciproche con tutti gli stakeholder. In un’ottica di miglioramento continuo ci prendiamo cura dei collaboratori, così come dei fornitori, dei clienti, dei territori in cui operiamo e delle comunità con cui interagiamo, consapevoli dell’impatto sociale ed ambientale delle nostre azioni.</mds-text>
        </ArticleWidgetContents>
        <ArticleWidgetAside>
          <mds-quote typography="h5">
            What one programmer can do in one month, two programmers can do in two months
            <mds-author class="text-adjust-tone-04" slot="author">
              <mds-avatar class="w-12 bg-brand-maggioli-12" initials="fb" slot="avatar" src="./fred-brooks-zoom.webp"/>
              <mds-text class="text-adjust-tone-02" typography="h6">
                Fred Brooks
              </mds-text>
              <mds-text typography="caption">
                Software engineer
              </mds-text>
            </mds-author>
          </mds-quote>
        </ArticleWidgetAside>
      </ArticleWidget>
      <ArticleKeyPoints>
        <ArticleKeyPoint icon="menu-book" title="Franco 9000">
          <mds-text typography="paragraph">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Laboriosam, nulla perferendis facere recusandae ipsa ab tempora voluptatum voluptates ullam sit excepturi quisquam, placeat consectetur suscipit. Eius ipsa consequatur eveniet nostrum!</mds-text>
          <div>
            <mds-button>Prova questo</mds-button>
          </div>
        </ArticleKeyPoint>
        <ArticleKeyPoint icon="menu-book" title="Franco 9000">
          <mds-text typography="paragraph">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Laboriosam, nulla perferendis facere recusandae ipsa ab tempora voluptatum voluptates ullam sit excepturi quisquam, placeat consectetur suscipit. Eius ipsa consequatur eveniet nostrum!</mds-text>
        </ArticleKeyPoint>
        <ArticleKeyPoint icon="menu-book" title="Franco 9000">
          <mds-text typography="paragraph">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Laboriosam, nulla perferendis facere recusandae ipsa ab tempora voluptatum voluptates ullam sit excepturi quisquam, placeat consectetur suscipit. Eius ipsa consequatur eveniet nostrum!</mds-text>
        </ArticleKeyPoint>
        <ArticleKeyPoint icon="menu-book" title="Franco 9000">
          <mds-text typography="paragraph">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Laboriosam, nulla perferendis facere recusandae ipsa ab tempora voluptatum voluptates ullam sit excepturi quisquam, placeat consectetur suscipit. Eius ipsa consequatur eveniet nostrum!</mds-text>
        </ArticleKeyPoint>
      </ArticleKeyPoints>
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
      <ArticleWidget>
        <ArticleWidgetContents>
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
        </ArticleWidgetContents>
        <ArticleWidgetAside>
          <ArticleRelatedLinks title="Contenuti correlati">
            <mds-list-item><mds-text><a href="#">Hello world</a></mds-text></mds-list-item>
            <mds-list-item><mds-text><a href="#">Il contributo di un web-component se usato male</a></mds-text></mds-list-item>
            <mds-list-item><mds-text><a href="#">Antani alla brematurata</a></mds-text></mds-list-item>
          </ArticleRelatedLinks>
        </ArticleWidgetAside>
      </ArticleWidget>
      <ArticleKeyPoints>
        <mds-usage>
          <mds-text>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</mds-text>
          <mds-text>Laboriosam, nulla perferendis facere recusandae ipsa ab tempora voluptatum voluptates ullam sit excepturi quisquam, placeat consectetur suscipit. Eius ipsa consequatur eveniet nostrum!</mds-text>
        </mds-usage>
        <mds-usage variant="dont">
          <mds-text>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius ipsa consequatur eveniet nostrum!</mds-text>
          <mds-text>Laboriosam, nulla perferendis facere recusandae ipsa ab tempora voluptatum voluptates ullam sit excepturi quisquam, placeat consectetur suscipit.</mds-text>
        </mds-usage>
        <mds-usage variant="warn">
          <mds-text>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</mds-text>
          <mds-text>Laboriosam, nulla perferendis facere recusandae ipsa ab tempora voluptatum voluptates ullam sit excepturi quisquam, placeat consectetur suscipit. Eius ipsa consequatur eveniet nostrum!</mds-text>
        </mds-usage>
        <mds-usage variant="dont">
          <mds-text>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius ipsa consequatur eveniet nostrum!</mds-text>
          <mds-text>Laboriosam, nulla perferendis facere recusandae ipsa ab tempora voluptatum voluptates ullam sit excepturi quisquam, placeat consectetur suscipit.</mds-text>
        </mds-usage>
      </ArticleKeyPoints>
      <div className="grid gap-6">
        <mds-text typography="h4" class="text-brand-maggioli-02">Design Language</mds-text>
        <ArticleSeparator/>
        <ArticleWidget>
          <ArticleWidgetContents>
            <mds-text typography="paragraph" class="max-w-text">Da oltre 115 anni siamo una Family Company che da ben quattro generazioni ama definirsi usando l’espressione “innovatori per tradizione”: un’espressione che racchiude il nostro spirito imprenditoriale e ben interpreta i principi ed i valori alla base della nostra cultura d&apos;impresa.</mds-text>
          </ArticleWidgetContents>
        </ArticleWidget>
        <div className="grid tablet:grid-cols-2 gap-6">
          <mds-benchmark-bar value={14} class="flex-grow" variant="primary">Brand</mds-benchmark-bar>
          <mds-benchmark-bar value={83} class="flex-grow" variant="primary">Logo</mds-benchmark-bar>
          <mds-benchmark-bar value={67} class="flex-grow" variant="primary">Linee guida</mds-benchmark-bar>
        </div>
      </div>
      <Roadmap title="Brand" description="Da oltre 115 anni siamo una Family Company che da ben quattro generazioni ama definirsi usando l’espressione “innovatori per tradizione”: un’espressione che racchiude il nostro spirito imprenditoriale e ben interpreta i principi ed i valori alla base della nostra cultura d'impresa.">
        <RoadmapItem done={true} title="Logo" description="Perché esisti, quali sono i tuoi valori e come questi aiuteranno a guidare il futuro del tuo prodotto. Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur, vel ad. Harum aliquid inventore dolorum non molestiae eius, reprehenderit repellendus blanditiis iusto perspiciatis necessitatibus ipsam consequuntur esse cumque iste mollitia?">
          <mds-button size="sm" slot="action">Vai alla contenuto</mds-button>
          <mds-button size="sm" slot="action" tone="ghost">Storybook</mds-button>
        </RoadmapItem>
        <RoadmapItem done={true} title="Vision" description="Perché esisti, quali sono i tuoi valori e come questi aiuteranno a guidare il futuro del tuo prodotto. Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur, vel ad. Harum aliquid inventore dolorum non molestiae eius, reprehenderit repellendus blanditiis iusto perspiciatis necessitatibus ipsam consequuntur esse cumque iste mollitia?">
          <mds-button size="sm" slot="action">Vai alla contenuto</mds-button>
          <mds-button size="sm" slot="action" tone="ghost">Storybook</mds-button>
        </RoadmapItem>
        <RoadmapItem done={false} title="Immagine coordinata" description="Perché esisti, quali sono i tuoi valori e come questi aiuteranno a guidare il futuro del tuo prodotto. Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur, vel ad. Harum aliquid inventore dolorum non molestiae eius, reprehenderit repellendus blanditiis iusto perspiciatis necessitatibus ipsam consequuntur esse cumque iste mollitia?">
          <mds-button size="sm" slot="action">Vai alla contenuto</mds-button>
          <mds-button size="sm" slot="action" tone="ghost">Storybook</mds-button>
        </RoadmapItem>
      </Roadmap>
      <Roadmap title="Componenti" description="Da oltre 115 anni siamo una Family Company che da ben quattro generazioni ama definirsi usando l’espressione “innovatori per tradizione”: un’espressione che racchiude il nostro spirito imprenditoriale e ben interpreta i principi ed i valori alla base della nostra cultura d'impresa.">
        <RoadmapItem done={true} title="Logo" description="Perché esisti, quali sono i tuoi valori e come questi aiuteranno a guidare il futuro del tuo prodotto. Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur, vel ad. Harum aliquid inventore dolorum non molestiae eius, reprehenderit repellendus blanditiis iusto perspiciatis necessitatibus ipsam consequuntur esse cumque iste mollitia?">
          <mds-button size="sm" slot="action">Vai alla contenuto</mds-button>
          <mds-button size="sm" slot="action" tone="ghost">Storybook</mds-button>
        </RoadmapItem>
        <RoadmapItem done={true} title="Vision" description="Perché esisti, quali sono i tuoi valori e come questi aiuteranno a guidare il futuro del tuo prodotto. Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur, vel ad. Harum aliquid inventore dolorum non molestiae eius, reprehenderit repellendus blanditiis iusto perspiciatis necessitatibus ipsam consequuntur esse cumque iste mollitia?">
          <mds-button size="sm" slot="action">Vai alla contenuto</mds-button>
          <mds-button size="sm" slot="action" tone="ghost">Storybook</mds-button>
        </RoadmapItem>
        <RoadmapItem done={false} title="Immagine coordinata" description="Perché esisti, quali sono i tuoi valori e come questi aiuteranno a guidare il futuro del tuo prodotto. Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur, vel ad. Harum aliquid inventore dolorum non molestiae eius, reprehenderit repellendus blanditiis iusto perspiciatis necessitatibus ipsam consequuntur esse cumque iste mollitia?">
          <mds-button size="sm" slot="action">Vai alla contenuto</mds-button>
          <mds-button size="sm" slot="action" tone="ghost">Storybook</mds-button>
        </RoadmapItem>
      </Roadmap>
      <ArticleSeparator/>
      <ArticleWidget>
        <ArticleWidgetContents>
          <ArticlePreview/>
        </ArticleWidgetContents>
        <ArticleWidgetAside>
          <ArticleRelatedContent title="Argomenti">
            <mds-list class="gap-0">
              <mds-list-item><mds-text typography="caption">Refactoring</mds-text></mds-list-item>
              <mds-list-item><mds-text typography="caption">Restyling</mds-text></mds-list-item>
            </mds-list>
          </ArticleRelatedContent>
        </ArticleWidgetAside>
      </ArticleWidget>
      <ArticleSeparator/>
      <ArticleWidget>
        <ArticleWidgetContents>
          <ArticlePreview/>
        </ArticleWidgetContents>
        <ArticleWidgetAside>
          <ArticleRelatedContent title="Argomenti">
            <mds-list class="gap-0">
              <mds-list-item><mds-text typography="caption">Refactoring</mds-text></mds-list-item>
              <mds-list-item><mds-text typography="caption">Restyling</mds-text></mds-list-item>
            </mds-list>
          </ArticleRelatedContent>
        </ArticleWidgetAside>
      </ArticleWidget>
      <ArticleSeparator/>
      <ArticleWidget>
        <ArticleWidgetContents>
          <ArticlePreview/>
        </ArticleWidgetContents>
        <ArticleWidgetAside>
          <ArticleRelatedContent title="Argomenti">
            <mds-list class="gap-0">
              <mds-list-item><mds-text typography="caption">Refactoring</mds-text></mds-list-item>
              <mds-list-item><mds-text typography="caption">Restyling</mds-text></mds-list-item>
            </mds-list>
          </ArticleRelatedContent>
        </ArticleWidgetAside>
      </ArticleWidget>
      <ArticleWidget>
        <ArticleWidgetContents>
          <Release name="mds-text" date="2022-01-12" version="1.0.3" commits={32}>
            <ReleaseCommit category="fix" message="Add typography property to prevent stuff to work bad and be depressed, so please understand me"/>
            <ReleaseCommit category="style" message="Change default text color"/>
            <ReleaseCommit category="refact" message="Move variants into separated file"/>
          </Release>
          <Release name="mds-icon" date="2022-01-06" version="2.0.3" commits={7}>
            <ReleaseCommit category="change" message="Change default text color"/>
            <ReleaseCommit category="feat" message="Add typography property"/>
            <ReleaseCommit category="refact" message="Move variants into separated file"/>
          </Release>
          <Release name="icons" date="2022-01-04" version="1.4.7" commits={14} last>
            <ReleaseCommit category="style" message="Change default text color"/>
            <ReleaseCommit category="refact" message="Move variants into separated file"/>
            <ReleaseCommit category="fix" message="Add typography property"/>
          </Release>
        </ArticleWidgetContents>
        <ArticleWidgetAside>
          <ArticleRelatedContent title="Perché UX e UI sono così cool?">
            <mds-text typography="caption" class="max-w-text">Da oltre 115 anni siamo una Family Company che da ben quattro generazioni ama definirsi usando l’espressione “innovatori per tradizione”: un’espressione che racchiude il nostro spirito imprenditoriale e ben interpreta i principi ed i valori alla base della nostra cultura d&apos;impresa.</mds-text>
          </ArticleRelatedContent>
        </ArticleWidgetAside>
      </ArticleWidget>
      <footer>
        <Authors/>
        <Bibliography/>
      </footer>
    </article>
  </div>

export default CompanyValues

import Layout from '../fragments/layouts/section'
import AsideMenu from '../fragments/layouts/fragments/aside/menu'
import ContentWrapper from '../fragments/layouts/fragments/content-wrapper'
import AsideButton from '../fragments/layouts/fragments/aside/button'

CompanyValues.getLayout = (page: ReactElement) =>
  <Layout title={articleTitle}>
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
