import clsx from 'clsx'
import { ReactNode, FC } from 'react'
import { ReactComponentProps } from '../../meta/props/ReactComponent'

interface ArticleKeyPointProps {
  className?: string,
  children?: ReactNode,
  title: string,
  icon?: string,
  action?: string,
}

const ArticleKeyPoints: FC<ReactComponentProps> = ({ className, children }: ReactComponentProps): JSX.Element =>
  <div className={clsx(className, 'gap-12 grid tablet:grid-cols-2')}>
    { children }
  </div>

const ArticleKeyPoint: FC<ArticleKeyPointProps> = ({
  children,
  className,
  icon,
  title,
}: ArticleKeyPointProps): JSX.Element =>
  <div className={clsx(className, 'gap-4 grid grid-cols-1 auto-rows-min')}>
    { icon
      ? <div className="flex gap-4 items-center text-brand-maggioli-02">
        <mds-icon name={icon} class="text-4xl leading-none"/>
        <mds-text typography="h5" class="text-brand-maggioli-02">{ title }</mds-text>
      </div>
      : <mds-text typography="h5" class="text-brand-maggioli-02">{ title }</mds-text>
    }
    <div className="gap-6 grid">
      { children }
    </div>
  </div>

export default ArticleKeyPoints
export {
  ArticleKeyPoint,
}
