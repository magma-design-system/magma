import { ReactElement, FC } from 'react'
import Header from './fragments/header/homepage'
import ContentWrapper from './fragments/content-wrapper'
import { LayoutProps } from '../../meta/props/LayoutProps'

const Layout: FC<LayoutProps> = ({ children, title }: LayoutProps): ReactElement =>
  <main className="dark-mode-os">
    <Header/>
    <ContentWrapper>
      { children }
    </ContentWrapper>
  </main>

export default Layout
