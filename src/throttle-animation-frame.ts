/**
 * Ensures that `func` is not called more than once per animation frame.
 *
 * Using requestAnimationFrame in this way ensures that we render as often as
 * possible without excessively blocking the UI.
 */
export function throttleAnimationFrame(func: () => void): () => void {
  let wait = false;

  return () => {
    if (!wait) {
      wait = true;
      requestAnimationFrame(() => {
        func();
        wait = false;
      });
    } else {
      console.debug("AutoFit throttling to next animation frame");
    }
  };
}
