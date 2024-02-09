import jsonIconsDictionary from '../fixtures/icons.json'
import jsonMggIconsDictionary from '../fixtures/iconsauce.json'
const iconsDictionary = jsonIconsDictionary
const mggIconsDictionary = jsonMggIconsDictionary
const svgIconsDictionary = [
  `${location.origin}/svg/mi/baseline/email.svg`,
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgLTk2MCA5NjAgOTYwIiB3aWR0aD0iMjQiPjxwYXRoIGQ9Im0yMzMtODAgNjUtMjgxTDgwLTU1MGwyODgtMjUgMTEyLTI2NSAxMTIgMjY1IDI4OCAyNS0yMTggMTg5IDY1IDI4MS0yNDctMTQ5TDIzMy04MFoiLz48L3N2Zz4=',
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6s-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8s-3.58-8-8-8z"/></svg>',
]

export {
  iconsDictionary,
  mggIconsDictionary,
  svgIconsDictionary,
}
