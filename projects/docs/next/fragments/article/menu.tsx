import clsx from 'clsx'
import { FC } from 'react'
import { ArticleSeparator as Separator } from '../separator'

type ComponentProps = {
  className?: string
}

const ArticleMenu: FC<ComponentProps> = ({ className }): JSX.Element =>
  <div className={clsx('-mx-6 desktop:backdrop-blur-md desktop:backdrop-saturate-200 backdrop-saturate-50 desktop:bg-adjust-tone-10/80 bg-adjust-tone-10/90 pt-4 px-6 sticky top-20 z-10')}>
    <mds-tab class="bg-transparent -mx-2">
      <mds-tab-item>Condotta</mds-tab-item>
      <mds-tab-item>Commit</mds-tab-item>
      <mds-tab-item>Submission</mds-tab-item>
      <mds-tab-item>Versionamento</mds-tab-item>
    </mds-tab>
    <Separator className='mt-4 -mx-6-'/>
  </div>

export default ArticleMenu
