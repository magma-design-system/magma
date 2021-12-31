import { ReactNode, ReactElement, FC } from 'react'
import Header from './fragments/header/homepage'
import ContentWrapper from './fragments/content-wrapper'

type LayoutProps = {
  children?: ReactNode
}

const Layout: FC<LayoutProps> = ({ children }): ReactElement => {
  return (
    <main className="dark-mode-os">
      <Header />
      <ContentWrapper>
        { children }
      </ContentWrapper>
    </main>
  )
}

export default Layout
