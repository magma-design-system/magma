/**
 * It splits the url in words.
 * Remove starting and ending slashes before splitting the slug.
 * @param {string} slug url of the page
 * @returns {object{}} style object for React
 */

export function aspectRatioPaddingTop(aspectRatio) {
  const ratioBase = parseInt(aspectRatio.split(':')[1])
  const ratioDivisor = parseInt(aspectRatio.split(':')[0])
  return `${(ratioBase / ratioDivisor * 100).toFixed(2)}%`
}

export function aspectRatio(aspectRatio) {
  return { paddingTop: aspectRatioPaddingTop(aspectRatio) }
}
