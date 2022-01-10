import clsx from 'clsx'
import { FC } from 'react'

type ComponentProps = {
  className?: string
}

const ArticleRelatedContent: FC<ComponentProps> = ({ className }): JSX.Element =>
  <div className={clsx('flex flex-col gap-1 p-4 border rounded-xl border-adjust-tone-02 border-solid', className)}>
    <mds-text typography="label">Contenuti correlati</mds-text>
    <mds-list class="p-0 gap-1">
      <mds-list-item><mds-text><a href="#">Hello world</a></mds-text></mds-list-item>
      <mds-list-item><mds-text><a href="#">Il contributo di un web-component se usato male</a></mds-text></mds-list-item>
      <mds-list-item><mds-text><a href="#">Antani alla brematurata</a></mds-text></mds-list-item>
    </mds-list>
  </div>

export default ArticleRelatedContent
