import clsx from 'clsx'
import { FC } from 'react'
import { ArticleSeparator as Separator } from '../separator'
import { ReactComponentProps } from '../../meta/props/ReactComponent'

const ArticleMenu: FC<ReactComponentProps> = ({ className, children }: ReactComponentProps): JSX.Element =>
  <div className={clsx('-mx-6 blur-overlay pt-4 px-6 sticky top-20 z-10', className)}>
    <mds-tab class="bg-transparent -mx-2">
      { children }
    </mds-tab>
    <Separator className='mt-4 -mx-6-'/>
  </div>

export default ArticleMenu
