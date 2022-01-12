import type { ReactElement } from 'react'
import Header from '../fragments/article/header'
import Menu from '../fragments/article/menu'
import ArticleSimpleContent from '../fragments/article/simple-content'
import ArticleKeyPoints, { ArticleKeyPoint } from '../fragments/article/key-points'
import Authors from '../fragments/article/authors'
import Bibliography from '../fragments/article/bibliography'

const CompanyValues = (): JSX.Element =>
  <div>
    <Header title="Contribuisci"/>
    <Menu>
      <mds-tab-item>Condotta</mds-tab-item>
      <mds-tab-item>Commit</mds-tab-item>
      <mds-tab-item>Submission</mds-tab-item>
      <mds-tab-item>Versionamento</mds-tab-item>
    </Menu>
    <article className="py-12 grid gap-12 text-adjust-tone-01">
      <ArticleSimpleContent/>
      <ArticleSimpleContent/>
      <ArticleKeyPoints>
        <ArticleKeyPoint icon="menu-book" title="Franco 9000">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Laboriosam, nulla perferendis facere recusandae ipsa ab tempora voluptatum voluptates ullam sit excepturi quisquam, placeat consectetur suscipit. Eius ipsa consequatur eveniet nostrum!
        </ArticleKeyPoint>
        <ArticleKeyPoint icon="menu-book" title="Franco 9000">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Laboriosam, nulla perferendis facere recusandae ipsa ab tempora voluptatum voluptates ullam sit excepturi quisquam, placeat consectetur suscipit. Eius ipsa consequatur eveniet nostrum!
        </ArticleKeyPoint>
        <ArticleKeyPoint icon="menu-book" title="Franco 9000">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Laboriosam, nulla perferendis facere recusandae ipsa ab tempora voluptatum voluptates ullam sit excepturi quisquam, placeat consectetur suscipit. Eius ipsa consequatur eveniet nostrum!
        </ArticleKeyPoint>
        <ArticleKeyPoint icon="menu-book" title="Franco 9000">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Laboriosam, nulla perferendis facere recusandae ipsa ab tempora voluptatum voluptates ullam sit excepturi quisquam, placeat consectetur suscipit. Eius ipsa consequatur eveniet nostrum!
        </ArticleKeyPoint>
      </ArticleKeyPoints>
      <ArticleSimpleContent/>
      <footer>
        <Authors/>
        <Bibliography/>
      </footer>
    </article>
  </div>

export default CompanyValues

import Layout from '../fragments/layouts/section'
import AsideMenu from '../fragments/layouts/fragments/aside/menu'
import ContentWrapper from '../fragments/layouts/fragments/content-wrapper'
import AsideButton from '../fragments/layouts/fragments/aside/button'

CompanyValues.getLayout = (page: ReactElement) =>
  <Layout title="Contribute">
    <AsideMenu className="-mt-20 bg-adjust-tone-10">
      <AsideButton name="Components" opened>
        <AsideButton name="Button" selected/>
        <AsideButton name="Checkbox"/>
        <AsideButton name="Download"/>
      </AsideButton>
      <AsideButton name="Design Tokens"/>
      <AsideButton name="Accessibility"/>
      <AsideButton name="CSS"/>
    </AsideMenu>
    <ContentWrapper>
      { page }
    </ContentWrapper>
  </Layout>
