import { options } from 'preact'

// Preact runs the effects after a paint from requestAnimationFrame, with a 35 ms setTimeout as a
// fallback that calls cancelAnimationFrame (preact/hooks, afterNextFrame). A test file that ends
// before the fallback fires leaves it to run once jsdom is torn down, where cancelAnimationFrame
// no longer exists: an unhandled ReferenceError fails the run with every test green (seen in CI
// on draft.test.mts). A task of the event loop needs no global of the environment and still
// runs the effects after the render, so every file of the studio schedules them with one.
options.requestAnimationFrame = (callback) => {
  setTimeout(callback)
}
