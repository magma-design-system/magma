module.exports = {
  chromeSelector: '.wrapper > *, #root > *, .story-decorator > *',
  chromeTolerance: 0.3,
  diffingEngine: 'looks-same',
  storiesFilter: '',
  configurations: {
    'chrome.laptop': {
      target: 'chrome.docker',
      width: 1366,
      height: 768,
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
