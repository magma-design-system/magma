const int32 = 2147483647

const gen: (arg0: number) => number = v => (v * 16807) % int32

const randomFloat: (arg0: number) => number = v => gen(v) / int32

const randomInt: (arg0: number) => number = v => gen(v)

type Generator = (
  _?: number
) => {
  random: () => number
  randomFloat: () => number
  range: (min: number, max: number) => number
  rangeFloat: (min: number, max: number) => number
}
export const generator: Generator = (seed = 1) => {
  let value = seed < 1 ? 1 : seed

  const next: () => number = () => {
    value = randomInt(value)
    return value
  }

  return {
    random: () => next(),
    randomFloat: () => randomFloat(next()),
    range: (min, max) => {
      const minimum = min - 0.4999
      const maximum = max + 0.4999
      return Math.round(minimum + (maximum - minimum) * randomFloat(next()))
    },
    rangeFloat: (min, max) => min + (max - min) * randomFloat(next()),
  }
}
