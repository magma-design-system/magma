import clsx from 'clsx'
import { ReactNode, FC } from 'react'

type ComponentProps = {
  className?: string
  children?: ReactNode
}

interface ArticleKeyPointProps {
  className?: string,
  children?: ReactNode,
  title: string,
  icon?: string,
  action?: string,
}

const ArticleKeyPoints: FC<ComponentProps> = ({ className, children }): JSX.Element =>
  <div className="grid grid-cols-2 gap-6">
    { children }
  </div>

const ArticleKeyPoint: FC<ArticleKeyPointProps> = ({ action, children, className, icon, title }: ArticleKeyPointProps): JSX.Element =>
  <div className="grid gap-4">
    { icon
      ? <div className="flex gap-4 items-center text-brand-maggioli-02">
        <mds-icon name={icon} class="text-4xl leading-none"/>
        <mds-text typography="h5" class="text-brand-maggioli-02">{ title }</mds-text>
      </div>
      : <mds-text typography="h5" class="text-brand-maggioli-02">{ title }</mds-text>
    }
    <mds-text typography="paragraph">{ children }</mds-text>
  </div>

export default ArticleKeyPoints
export {
  ArticleKeyPoint,
}
