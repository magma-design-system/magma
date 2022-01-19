import clsx from 'clsx'
import { FC } from 'react'
import Separator from '../separator'
import { ReactComponentProps } from '../../meta/props/ReactComponent'

const ArticleMenu: FC<ReactComponentProps> = ({ className, children }: ReactComponentProps): JSX.Element =>
  <div className={clsx('-mx-6 blur-overlay tablet:pt-4 pt-2 sticky top-20 z-20', className)}>
    <mds-tab class="px-6 bg-transparent rounded-none">
      { children }
    </mds-tab>
    <Separator className='tablet:mt-4 mt-2'/>
  </div>

export default ArticleMenu
