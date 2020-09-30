/**
 * It splits the url in words.
 * Remove starting and ending slashes before splitting the slug.
 * @param {string} slug url of the page
 * @returns {object{}} style object for React
 */

export function aspectRatio(aspectRatio) {
  const ratioBase = parseInt(aspectRatio.split(':')[1])
  const ratioDivisor = parseInt(aspectRatio.split(':')[0])
  return { paddingTop: `${(ratioBase / ratioDivisor * 100).toFixed(2)}%` }
}
