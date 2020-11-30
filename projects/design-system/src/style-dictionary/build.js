const StyleDictionary = require('./formats/scss-map/scss-map')
  .extend('./config.json')

StyleDictionary.buildAllPlatforms()
/*
// https://leonardocolor.io/?colorKeys=%23{ffffff}&base={ffffff}&ratios=1.05%2C1.15%2C1.26%2C1.4%2C1.6%2C1.9%2C2.25%2C2.7%2C4%2C4.8%2C5.75%2C7%2C8.5%2C10.3%2C12.45%2C13.45&mode=CAM02
const ratios = [
  1.05,
  1.1,
  1.16,
  1.24,
  1.32,
  1.41,
  1.51,
  1.65,
  1.9,
  2.25,
  2.7,
  3.3,
  4,
  4.8,
  5.75,
  7,
  8.5,
  10.3,
  12.45,
  14,
]
const color = 'ffffff'
console.log(`https://leonardocolor.io/?colorKeys=%23${color}&base=${color}&ratios=${ratios.join('%2C')}&mode=CAM02`, ratios.length + 1)
*/
