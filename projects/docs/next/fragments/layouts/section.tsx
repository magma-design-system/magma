import { ReactElement, FC } from 'react'
import Header from './fragments/header/section'
import { ReactComponentProps } from '../../meta/props/ReactComponent'

const Layout: FC<ReactComponentProps> = ({ children }: ReactComponentProps): ReactElement => {
  return (
    <main className="pt-20 dark-mode-os">
      <Header />
      <div className="grid desktop:grid-cols-section">
        { children }
      </div>
    </main>
  )
}

export default Layout
