const basePathTitles = {
  doc: 'Doc',
  use: 'Use',
  dev: 'Dev',
}

export function createMenuList(edges) {
  let menuList = []
  edges.forEach(({ node: { slug, frontmatter } }) => {
    const path = (slug.endsWith('/') ? slug.slice(0, -1) : slug).split('/')
    if (isBlacklisted(path)) return // Some pages shouldn't be in the menu

    menuList = createStructure(menuList, path)
    const parent = findVoceMenu(menuList, path.slice(0, -1))

    const menuItemData = {
      id: path[path.length - 1],
      title: frontmatter.title,
      url: `/${slug}`,
    }

    const menuItem = parent.children.find(voce => voce.id === menuItemData.id)
    if (menuItem == null) throw new Error(`menuItem ${menuItemData.id} with url ${menuItemData.url} not found. It should be created with createStructure.`)
    menuItem.title = menuItemData.title
    menuItem.url = menuItemData.url
  })
  menuList.forEach(voceMenu => (voceMenu.title = basePathTitles[voceMenu.id]))
  return menuList
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

function findVoceMenu(menuList, path) {
  const menuItem = menuList.find(voce => voce.id === path[0])
  if (path.length > 1) return findVoceMenu(menuItem.children, path.slice(1))
  return menuItem
}

function isBlacklisted(path) {
  return isHomePage(path)
}

function isHomePage(path) {
  return path.length === 1 && path[0] === ''
}
