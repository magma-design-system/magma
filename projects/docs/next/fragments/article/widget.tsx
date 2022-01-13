import type { FC } from 'react'
import { ReactComponentProps } from '../../meta/props/ReactComponent'


const ArticleWidgetContents: FC<ReactComponentProps> = ({ children }: ReactComponentProps): JSX.Element =>
  <div className="tablet:col-span-3 grid gap-6">
    { children }
  </div>

const ArticleWidgetAside: FC<ReactComponentProps> = ({ children }: ReactComponentProps): JSX.Element =>
  <div className="relative">
    <div className="sticky top-48 grid gap-6">
      { children }
    </div>
  </div>

const ArticleWidget: FC<ReactComponentProps> = ({ children }: ReactComponentProps): JSX.Element =>
  <div className="grid tablet:grid-cols-4 gap-6">
    { children }
  </div>

export {
  ArticleWidget,
  ArticleWidgetAside,
  ArticleWidgetContents,
}
