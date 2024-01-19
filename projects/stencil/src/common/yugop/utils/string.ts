// export const strToCharCodeArray: string => number[] = str => str.split('').map(item => item.charCodeAt(0));

export const strToCharCodeArray: (arg0: string) => number[] = str =>
  str.split('').map(item => item.charCodeAt(0))
