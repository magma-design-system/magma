import clsx from 'clsx'
import { FC } from 'react'
import { ReactComponentProps } from '../../meta/props/ReactComponent'
import Card from '../card'

const ArticleRelatedContent: FC<ReactComponentProps> = ({ className }: ReactComponentProps): JSX.Element =>
  <Card className={clsx('gap-2', className)}>
    <mds-text typography="label">Contenuti correlati</mds-text>
    <mds-list class="p-0 gap-1">
      <mds-list-item><mds-text><a href="#">Hello world</a></mds-text></mds-list-item>
      <mds-list-item><mds-text><a href="#">Il contributo di un web-component se usato male</a></mds-text></mds-list-item>
      <mds-list-item><mds-text><a href="#">Antani alla brematurata</a></mds-text></mds-list-item>
    </mds-list>
  </Card>

export default ArticleRelatedContent
