const randomNumber = (min: number, max: number, integer: boolean = false): number => {
  const num = Math.random() * (max - min) + min
  return integer ? Math.floor(num) : num
}

export {
  randomNumber,
}
