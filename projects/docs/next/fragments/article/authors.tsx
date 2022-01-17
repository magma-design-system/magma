import clsx from 'clsx'
import { FC } from 'react'
import { ArticleSeparator as Separator } from '../separator'
import { ReactComponentProps } from '../../meta/props/ReactComponent'

const ArticleAuthors: FC<ReactComponentProps> = ({ className }: ReactComponentProps): JSX.Element =>
  <div className={clsx('flex flex-col gap-8 min-h-32 pt-8', className)}>
    <Separator className='mt-4'/>
    <mds-text typography="h5">Autori di questo articolo</mds-text>
    <div className="grid gap-4 grid-cols-1 tablet:grid-cols-2 wide:grid-cols-3">
      <mds-author>
        <mds-avatar slot="avatar" initials="vv" class="w-16 h-16"/>
        <mds-text typography="h6">Vittorio Vittori</mds-text>
        <mds-text typography="caption">Design System Manager</mds-text>
        <mds-text typography="caption">Ieri</mds-text>
      </mds-author>
      <mds-author>
        <mds-avatar slot="avatar" initials="sc" class="w-16 h-16"/>
        <mds-text typography="h6">Sara Costantini</mds-text>
        <mds-text typography="caption">UI Designer</mds-text>
        <mds-text typography="caption">4 giorni fa</mds-text>
      </mds-author>
      <mds-author>
        <mds-avatar slot="avatar" initials="ap" class="w-16 h-16"/>
        <mds-text typography="h6">Andre Pruccoli</mds-text>
        <mds-text typography="caption">Software Engineer</mds-text>
        <mds-text typography="caption">1 settimana fa</mds-text>
      </mds-author>
    </div>
  </div>

export default ArticleAuthors
