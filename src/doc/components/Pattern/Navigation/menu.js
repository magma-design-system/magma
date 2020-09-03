const basePathTitles = {
  '': 'Home Page',
  doc: 'Doc',
  use: 'Use',
  dev: 'Dev',
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

export function findMenuItem(menuList, url) {
  return findMenuItemFromPath(menuList, pathFromSlug(url))
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

function findMenuItemFromPath(menuList, [voceId, ...restPath]) {
  const menuItem = menuList.find(voce => voce.id === voceId)
  if (restPath.length > 0) return findMenuItemFromPath(menuItem.children, restPath)
  return menuItem
}
