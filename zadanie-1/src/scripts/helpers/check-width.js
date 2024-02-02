export const checkWidth = (width) => {
  return window.matchMedia(`(max-width: ${width}px)`).matches
}