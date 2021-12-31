import clsx from 'clsx'
import { FC } from 'react'
import Separator from '../separator'

type ComponentProps = {
  className?: string
}

const ArticleAuthors: FC<ComponentProps> = ({ className }): JSX.Element =>
  <div className={clsx('flex flex-col gap-8 min-h-32 pt-8 backdrop-blur-md backdrop-saturate-200 bg-adjust-tone-10/80 -mx-6 px-6', className)}>
    <Separator className='mt-4 -mx-6-'/>
    <mds-text typography="h5">Autori</mds-text>
    <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4">
      <mds-author>
        <mds-avatar slot="avatar" src="https://it.gravatar.com/userimage/1219639/98ec57f59516a7a1ee21b25189ec046a.png?size=96" class="w-12 h-12"/>
        <mds-text typography="h6">Vittorio Vittori</mds-text>
        <mds-text typography="caption">Design System Manager</mds-text>
      </mds-author>
    </div>
  </div>

export default ArticleAuthors
