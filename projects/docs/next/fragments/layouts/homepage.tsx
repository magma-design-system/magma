import { ReactElement, FC } from 'react'
import Header from './fragments/header/homepage'
import ContentWrapper from './fragments/content-wrapper'
import { ReactComponentProps } from '../../meta/props/ReactComponent'

const Layout: FC<ReactComponentProps> = ({ children }: ReactComponentProps): ReactElement =>
  <main className="dark-mode-os">
    <Header />
    <ContentWrapper>
      { children }
    </ContentWrapper>
  </main>

export default Layout
