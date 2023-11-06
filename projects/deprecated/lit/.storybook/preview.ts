import 'normalize.css'
import '@maggioli-design-system/styles/dist/css/colors-rgb.css'
import '@maggioli-design-system/styles/dist/css/globals.css'
import '@maggioli-design-system/styles/dist/css/reset.css'
import '@maggioli-design-system/styles/dist/css/base.css'
import '@fontsource/karla/400.css'
import '@fontsource/karla/700.css'
import '@fontsource/merriweather/300.css'
import '@fontsource/merriweather/400.css'
import '@fontsource/merriweather/700.css'
import '@fontsource/roboto-mono/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import '@fontsource/roboto/900.css'
import './tailwind.css'

// import { applyPolyfills as apMdsAccordion, defineCustomElements as dceMdsAccordion } from '@maggioli-design-system/mds-accordion/loader'
// import { applyPolyfills as apMdsAccordionItem, defineCustomElements as dceMdsAccordionItem } from '@maggioli-design-system/mds-accordion-item/loader'
// import { applyPolyfills as apMdsAuthor, defineCustomElements as dceMdsAuthor } from '@maggioli-design-system/mds-author/loader'
// import { applyPolyfills as apMdsAvatar, defineCustomElements as dceMdsAvatar } from '@maggioli-design-system/mds-avatar/loader'
// import { applyPolyfills as apMdsBadge, defineCustomElements as dceMdsBadge } from '@maggioli-design-system/mds-badge/loader'
// import { applyPolyfills as apMdsBanner, defineCustomElements as dceMdsBanner } from '@maggioli-design-system/mds-banner/loader'
// import { applyPolyfills as apMdsBenchmarkBar, defineCustomElements as dceMdsBenchmarkBar } from '@maggioli-design-system/mds-benchmark-bar/loader'
// import { applyPolyfills as apMdsBibliography, defineCustomElements as dceMdsBibliography } from '@maggioli-design-system/mds-bibliography/loader'
// import { applyPolyfills as apMdsButton, defineCustomElements as dceMdsButton } from '@maggioli-design-system/mds-button/loader'
// import { applyPolyfills as apMdsCard, defineCustomElements as dceMdsCard } from '@maggioli-design-system/mds-card/loader'
// import { applyPolyfills as apMdsDetails, defineCustomElements as dceMdsDetails } from '@maggioli-design-system/mds-details/loader'
// import { applyPolyfills as apMdsDropdown, defineCustomElements as dceMdsDropdown } from '@maggioli-design-system/mds-dropdown/loader'
// import { applyPolyfills as apMdsHeader, defineCustomElements as dceMdsHeader } from '@maggioli-design-system/mds-header/loader'
// import { applyPolyfills as apMdsHeaderBar, defineCustomElements as dceMdsHeaderBar } from '@maggioli-design-system/mds-header-bar/loader'
// import { applyPolyfills as apMdsHr, defineCustomElements as dceMdsHr } from '@maggioli-design-system/mds-hr/loader'
import { applyPolyfills as apMdsIcon, defineCustomElements as dceMdsIcon } from '@maggioli-design-system/mds-icon/loader'
// import { applyPolyfills as apMdsImg, defineCustomElements as dceMdsImg } from '@maggioli-design-system/mds-img/loader'
// import { applyPolyfills as apMdsList, defineCustomElements as dceMdsList } from '@maggioli-design-system/mds-list/loader'
// import { applyPolyfills as apMdsListItem, defineCustomElements as dceMdsListItem } from '@maggioli-design-system/mds-list-item/loader'
// import { applyPolyfills as apMdsModal, defineCustomElements as dceMdsModal } from '@maggioli-design-system/mds-modal/loader'
// import { applyPolyfills as apMdsProgress, defineCustomElements as dceMdsProgress } from '@maggioli-design-system/mds-progress/loader'
// import { applyPolyfills as apMdsQuote, defineCustomElements as dceMdsQuote } from '@maggioli-design-system/mds-quote/loader'
// import { applyPolyfills as apMdsTab, defineCustomElements as dceMdsTab } from '@maggioli-design-system/mds-tab/loader'
// import { applyPolyfills as apMdsTabBar, defineCustomElements as dceMdsTabBar } from '@maggioli-design-system/mds-tab-bar/loader'
// import { applyPolyfills as apMdsTabBarItem, defineCustomElements as dceMdsTabBarItem } from '@maggioli-design-system/mds-tab-bar-item/loader'
// import { applyPolyfills as apMdsTabItem, defineCustomElements as dceMdsTabItem } from '@maggioli-design-system/mds-tab-item/loader'
import { applyPolyfills as apMdsText, defineCustomElements as dceMdsText } from '@maggioli-design-system/mds-text/loader'
// import { applyPolyfills as apMdsTooltip, defineCustomElements as dceMdsTooltip } from '@maggioli-design-system/mds-tooltip/loader'
// import { applyPolyfills as apMdsUsage, defineCustomElements as dceMdsUsage } from '@maggioli-design-system/mds-usage/loader'

// apMdsAccordion().then(void dceMdsAccordion())
// apMdsAccordionItem().then(void dceMdsAccordionItem())
// apMdsAuthor().then(void dceMdsAuthor())
// apMdsAvatar().then(void dceMdsAvatar())
// apMdsBadge().then(void dceMdsBadge())
// apMdsBanner().then(void dceMdsBanner())
// apMdsBenchmarkBar().then(void dceMdsBenchmarkBar())
// apMdsBibliography().then(void dceMdsBibliography())
// apMdsButton().then(void dceMdsButton())
// apMdsCard().then(void dceMdsCard())
// apMdsDetails().then(void dceMdsDetails())
// apMdsDropdown().then(void dceMdsDropdown())
// apMdsHeader().then(void dceMdsHeader())
// apMdsHeaderBar().then(void dceMdsHeaderBar())
// apMdsHr().then(void dceMdsHr())
apMdsIcon().then(void dceMdsIcon())
// apMdsImg().then(void dceMdsImg())
// apMdsList().then(void dceMdsList())
// apMdsListItem().then(void dceMdsListItem())
// apMdsModal().then(void dceMdsModal())
// apMdsProgress().then(void dceMdsProgress())
// apMdsQuote().then(void dceMdsQuote())
// apMdsTab().then(void dceMdsTab())
// apMdsTabBar().then(void dceMdsTabBar())
// apMdsTabBarItem().then(void dceMdsTabBarItem())
// apMdsTabItem().then(void dceMdsTabItem())
apMdsText().then(void dceMdsText())
// apMdsTooltip().then(void dceMdsTooltip())
// apMdsUsage().then(void dceMdsUsage())

window.sessionStorage.setItem('mdsIconSvgPath', '/assets/svg/');

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}
