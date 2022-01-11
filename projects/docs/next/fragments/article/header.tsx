import clsx from 'clsx'
import { FC } from 'react'
import { ReactComponentProps } from '../../meta/props/ReactComponent'

const ArticleHeader: FC<ReactComponentProps> = ({ className }: ReactComponentProps): JSX.Element =>
  <div className={clsx('-mx-6 backdrop-saturate-50 bg-adjust-tone-10/90 desktop:backdrop-blur-md desktop:backdrop-saturate-200 desktop:bg-adjust-tone-10/80 flex flex-col gap-2 min-h-32 pt-8 px-6', className)}>
    <mds-text typography="h1" class="max-w-title">Lorem ipsum dolr sit amet</mds-text>
    <mds-text typography="label">6 febbraio 2019 / lettura da 9 min </mds-text>
  </div>

export default ArticleHeader
