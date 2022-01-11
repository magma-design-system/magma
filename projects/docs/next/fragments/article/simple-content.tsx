import clsx from 'clsx'
import { FC } from 'react'
import ArticleRelatedContent from './related-content'
import { ReactComponentProps } from '../../meta/props/ReactComponent'

const ArticleSimpleContent: FC<ReactComponentProps> = ({ className }: ReactComponentProps): JSX.Element =>
  <div className={clsx('grid tablet:grid-cols-4 gap-6', className)}>
    <div className="tablet:col-span-3 grid gap-6">
      <mds-text typography="h3" class="text-brand-maggioli-02 max-w-title">Una Family Company con obiettivi di sviluppo sostenibile</mds-text>
      <mds-text typography="paragraph" class="max-w-text">Da oltre 115 anni siamo una Family Company che da ben quattro generazioni ama definirsi usando l’espressione “innovatori per tradizione”: un’espressione che racchiude il nostro spirito imprenditoriale e ben interpreta i principi ed i valori alla base della nostra cultura d&apos;impresa.</mds-text>
      <mds-text typography="paragraph" class="max-w-text">Nel nostro percorso abbiamo reso la <a href="#">Responsabilità Sociale d’Impresa</a> il nostro modo unico e distintivo di essere e fare impresa, dentro e fuori. Creare valore condiviso nel breve, medio, e soprattutto nel lungo termine, è la bussola con cui ci orientiamo - giorno dopo giorno - nel costruire relazioni di crescita e di fiducia reciproche con tutti gli stakeholder. In un’ottica di miglioramento continuo ci prendiamo cura dei collaboratori, così come dei fornitori, dei clienti, dei territori in cui operiamo e delle comunità con cui interagiamo, consapevoli dell’impatto sociale ed ambientale delle nostre azioni.</mds-text>
      <mds-img src="./indian-boy.jpeg" class="rounded-xl text-secondary-paragraph max-w-text"/>
    </div>
    <div className="relative">
      <div className="sticky top-48 grid gap-6">
        <mds-text typography="h3" class="text-brand-maggioli-02">Una Family Company con obiettivi di sviluppo sostenibile</mds-text>
        <ArticleRelatedContent/>
      </div>
    </div>
  </div>

export default ArticleSimpleContent
