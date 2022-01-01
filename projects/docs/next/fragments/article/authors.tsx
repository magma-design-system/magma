import clsx from 'clsx'
import { FC } from 'react'
import { ArticleSeparator as Separator } from '../separator'

type ComponentProps = {
  className?: string
}

const ArticleAuthors: FC<ComponentProps> = ({ className }): JSX.Element =>
  <div className={clsx('flex flex-col gap-8 min-h-32 pt-8', className)}>
    <Separator className='mt-4'/>
    <mds-text typography="h5">Autori di questo articolo</mds-text>
    <div className="grid gap-4 grid-cols-1 tablet:grid-cols-3 desktop:grid-cols-4">
      <mds-author>
        <mds-avatar slot="avatar" src="https://it.gravatar.com/userimage/1219639/98ec57f59516a7a1ee21b25189ec046a.png?size=96" class="w-12 h-12"/>
        <mds-text typography="h6">Vittorio Vittori</mds-text>
        <mds-text typography="caption">Design System Manager</mds-text>
      </mds-author>
      <mds-author>
        <mds-avatar slot="avatar" initials="sc" class="w-12 h-12"/>
        <mds-text typography="h6">Sara Costantini</mds-text>
        <mds-text typography="caption">UI Designer</mds-text>
      </mds-author>
    </div>
  </div>

export default ArticleAuthors
