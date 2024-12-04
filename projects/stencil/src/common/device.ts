const isMobileDevice = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
  return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
}

export {
  isMobileDevice,
}
