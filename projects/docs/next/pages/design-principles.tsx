import type { ReactElement } from 'react'
import Header from '../fragments/article/header'
import Menu from '../fragments/article/menu'
import ArticleSimpleContent from '../fragments/article/simple-content'
import ArticleKeyPoints, { ArticleKeyPoint } from '../fragments/article/key-points'
import Authors from '../fragments/article/authors'
import Bibliography from '../fragments/article/bibliography'
import DesignPrinciple from '../fragments/design-principle'

const CompanyValues = (): JSX.Element =>
  <div>
    <Header title="Design principles"/>
    <Menu>
      <mds-tab-item>Leggi</mds-tab-item>
      <mds-tab-item>Cosa sono?</mds-tab-item>
    </Menu>
    <article className="py-12 grid gap-12 text-adjust-tone-01">
      <div className='-mt-12'>
        <DesignPrinciple title="Unified" description="Each piece is part of a greater whole and should contribute positively to the system at scale. There should be no isolated features or outliers."/>
        <DesignPrinciple title="Universal" description="Airbnb is used around the world by a wide global community. Our products and visual language should be welcoming and accessible."/>
        <DesignPrinciple title="Iconic" description="We’re focused when it comes to both design and functionality. Our work should speak boldly and clearly to this focus."/>
        <DesignPrinciple title="Conversational" description="Our use of motion breathes life into our products, and allows us to communicate with users in easily understood ways."/>
      </div>
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
  <Layout>
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
