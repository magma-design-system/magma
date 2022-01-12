import { ReactElement, FC } from 'react'
import SectionHeader from './fragments/header/section'
import { ReactComponentProps } from '../../meta/props/ReactComponent'

const Layout: FC<ReactComponentProps> = ({ children }: ReactComponentProps): ReactElement => {
  return (
    <main className="pt-20 dark-mode-os">
      <SectionHeader />
      <div className="grid desktop:grid-cols-section col-start-2 col-stop-2">
        { children }
      </div>
    </main>
  )
}

export default Layout
