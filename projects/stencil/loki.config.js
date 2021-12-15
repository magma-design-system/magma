module.exports = {
  chromeSelector: '.wrapper > *, #root > *, .story-decorator > *',
  chromeTolerance: 0.3,
  diffingEngine: 'looks-same',
  // storiesFilter: 'avatar',
  configurations: {
    'chrome.tablet': {
      target: 'chrome.docker',
      width: 768,
      height: 1024,
    },
    // 'chrome.iphone7': {
    //   target: 'chrome.docker',
    //   preset: 'iPhone 7',
    // },
    // 'chrome.a4': {
    //   target: 'chrome.docker',
    //   preset: 'A4 Paper',
    // },
  },
  // fetchFailIgnore: 'localhost:6006/1024x1024.png',
}
