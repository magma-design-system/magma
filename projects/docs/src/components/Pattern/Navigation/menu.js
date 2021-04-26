const basePathTitles = {
  '': 'Maggioli Design System',
  project: 'Project',
  info: 'Info',
  identity: 'Identity',
  governance: 'Governance',
}

export function createMenuList(edges) {
  let menuList = []
  edges.forEach(({ node: { slug, frontmatter } }) => {
    const path = pathFromSlug(slug)
    // if (isBlacklisted(path)) return // Some pages shouldn't be in the menu

    menuList = createStructure(menuList, path)
    const parentChildren = path.length === 1 ? menuList : findMenuItemFromPath(menuList, path.slice(0, -1)).children

    const menuItemData = {
      id: path[path.length - 1],
      title: frontmatter.title,
      url: `/${slug}`,
    }

    const menuItem = parentChildren.find(voce => voce.id === menuItemData.id)
    if (menuItem == null) throw new Error(`menuItem ${menuItemData.id} with url ${menuItemData.url} not found. It should be created with createStructure.`)
    menuItem.title = menuItemData.title
    menuItem.url = menuItemData.url
  })
  menuList.forEach(voceMenu => (voceMenu.title = basePathTitles[voceMenu.id]))
  return menuList
}

/**
 * Horizontal menu should be visible only when
 * @param menuItemList
 * @return {*[]|*}
 */
export function createHorizontalMenuList(menuItemList) {
  if (menuItemList.length < 3) return []

  const lastItem = menuItemList[menuItemList.length - 1]
  if (menuItemList.length === 3 && (!lastItem.children || lastItem.children.length === 0)) return []

  if (lastItem.children) return lastItem.children
  return menuItemList[menuItemList.length - 2].children
}

export function findMenuItem(menuList, url) {
  return findMenuItemFromPath(menuList, pathFromSlug(url))
}

export function createMenuItemList(menuList, url) {
  return createMenuItemListFromPath(menuList, pathFromSlug(url))
}

/**
 * It splits the url in words.
 * Remove starting and ending slashes before splitting the slug.
 * @param {string} slug url of the page
 * @returns {string[]} array of words
 */
function pathFromSlug(slug) {
  return slug.replace(/^\/?(.*?)\/?$/, '$1').split('/')
}

function createStructure(menu, [voceId, ...restPath]) {
  let menuItem = menu.find(voce => voce.id === voceId)
  if (menuItem == null) {
    menuItem = { id: voceId }
    menu.push(menuItem)
  }
  if (restPath.length > 0) {
    if (!menuItem.children) menuItem.children = []
    menuItem.children = createStructure(menuItem.children, restPath)
  }
  return menu
}

function createMenuItemListFromPath(menuList, [voceId, ...restPath]) {
  const menuItem = menuList.find(voce => voce.id === voceId)
  const menuItemList = [menuItem]
  if (restPath.length > 0) menuItemList.push(...createMenuItemListFromPath(menuItem.children, restPath))
  return menuItemList
}

function findMenuItemFromPath(menuList, path) {
  return createMenuItemListFromPath(menuList, path).pop()
}

export function getPageData(edges, url) {
  let page = {}
  edges.forEach(({ node: { slug, timeToRead, frontmatter } }) => {
    // console.log(pathFromSlug(url).toString(), pathFromSlug(slug).toString(), pathFromSlug(url).toString() === pathFromSlug(slug).toString())

    if (pathFromSlug(url).toString() === pathFromSlug(slug).toString()) {
      page = {
        frontmatter,
        slug,
        timeToRead,
      }
    }
  })
  return page
}

export function getCurrentUrl() {
  return typeof window !== 'undefined' ? window.location.pathname : ''
}
