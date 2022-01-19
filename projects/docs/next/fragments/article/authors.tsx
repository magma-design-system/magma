import clsx from 'clsx'
import { FC } from 'react'
import { ArticleSeparator as Separator } from '../separator'
import { ReactComponentProps } from '../../meta/props/ReactComponent'
import moment from 'moment'
import 'moment/locale/it'

moment.locale('it')

const ArticleAuthors: FC<ReactComponentProps> = ({ className }: ReactComponentProps): JSX.Element =>
  <div className={clsx('flex flex-col gap-8 min-h-32 pt-8', className)}>
    <Separator className='mt-4'/>
    <mds-text typography="h5">Autori di questo articolo</mds-text>
    <div className="grid gap-4 grid-cols-1 tablet:grid-cols-2 wide:grid-cols-3">
      <mds-author>
        <mds-avatar slot="avatar" initials="vv" class="w-16 h-16"/>
        <mds-text typography="h6">Vittorio Vittori</mds-text>
        <mds-text typography="caption">Design System Manager</mds-text>
        <mds-text typography="caption">{ moment('2022-01-19', 'YYYY-MM-DD').fromNow() }</mds-text>
      </mds-author>
      <mds-author>
        <mds-avatar slot="avatar" initials="sc" class="w-16 h-16"/>
        <mds-text typography="h6">Sara Costantini</mds-text>
        <mds-text typography="caption">UI Designer</mds-text>
        <mds-text typography="caption">{ moment('2022-01-16', 'YYYY-MM-DD').fromNow() }</mds-text>
      </mds-author>
      <mds-author>
        <mds-avatar slot="avatar" initials="ap" class="w-16 h-16"/>
        <mds-text typography="h6">Andre Pruccoli</mds-text>
        <mds-text typography="caption">Software Engineer</mds-text>
        <mds-text typography="caption" class="first-letter:uppercase">{ moment('2021-12-07', 'YYYY-MM-DD').fromNow() }</mds-text>
      </mds-author>
    </div>
  </div>

export default ArticleAuthors
