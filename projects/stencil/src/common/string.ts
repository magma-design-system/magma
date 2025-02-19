const levenshteinDistance = (a: string, b: string): number => {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    // eslint-disable-next-line no-nested-ternary
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }

  return dp[a.length][b.length]
}


const closest = (input: string, validCodes: string[]): string => {
  let [closest] = validCodes
  let minDistance = levenshteinDistance(input, closest)

  for (const code of validCodes) {
    const distance = levenshteinDistance(input, code)
    if (distance < minDistance) {
      minDistance = distance
      closest = code
    }
  }

  return closest
}

const firstLetterUppercase = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1)

export {
  closest,
  firstLetterUppercase,
  levenshteinDistance,
}
