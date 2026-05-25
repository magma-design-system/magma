const isSafari = (): boolean => {
  if (navigator) {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }
  return false;
};

export { isSafari };
