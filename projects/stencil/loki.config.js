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
  },
}
