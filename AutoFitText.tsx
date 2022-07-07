import {
  DetailedHTMLProps,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// function throttle<T extends unknown[]>(
//   func: (...args: T) => void,
//   delayMs: number
// ): (...args: T) => void {
//   let callCount = 0;
//   const wrapped = (...args: T): void => {
//     callCount++;

//     if (callCount === 1) {
//       func(...args);

//       setTimeout(() => {
//         callCount = 0;
//         wrapped(...args);
//       }, delayMs);
//     }
//   };

//   return wrapped;
// }

export function throttle<T extends unknown[]>(
  func: (...args: T) => void
): (...args: T) => void {
  console.log("throttle init");
  let count = 0;

  const wrapped = (...args: T): void => {
    console.log("calling", count);

    if (count === 0) {
      func(...args);
      requestAnimationFrame(() => {
        console.log("tick");
        if (count > 1) {
          count = 0;
          wrapped(...args);
        } else {
          count = 0;
        }
      });
    }

    count += 1;
  };

  return wrapped;
}

export type Props = {
  multiline?: boolean;
  minFontSizePx?: number;
  maxFontSizePx?: number;
};

export function autoFitText({
  innerEl,
  multiline = false,
  minFontSizePx = 5,
  maxFontSizePx = 200,
}: {
  innerEl: HTMLElement | undefined | null;
} & Props): void {
  if (!innerEl) return;

  const containerEl = innerEl.parentElement;
  if (!containerEl) return;

  if (containerEl.children.length > 1) {
    console.warn(
      `AutoSizeText has ${
        containerEl.children.length - 1
      } siblins. This may interfere with the auto-size algorithm.`
    );
  }

  const displayStyle = window
    .getComputedStyle(innerEl, null)
    .getPropertyValue("display");

  // if (displayStyle !== "inline-block") {
  //   throw new Error("Element should have style `display: inline-block`.");
  // }

  if (innerEl.scrollHeight === 0 || innerEl.scrollWidth === 0) {
    return;
  }

  const delta = 1;

  const fontSizeStr = window
    .getComputedStyle(innerEl, null)
    .getPropertyValue("font-size");
  let fontSizePx = parseFloat(fontSizeStr);

  // console.log(fontSizeStr, fontSizePx);

  console.log(
    "pre loop",
    `(${innerEl.scrollWidth}, ${innerEl.scrollHeight}) - (${containerEl.clientWidth}, ${containerEl.clientHeight})`
  );

  if (!multiline) {
    while (
      innerEl.scrollWidth <= containerEl.clientWidth &&
      fontSizePx < maxFontSizePx
    ) {
      fontSizePx += delta;
      innerEl.style.fontSize = `${fontSizePx}px`;
      console.log(
        "singleline, looping up",
        fontSizePx,
        `(${innerEl.scrollWidth}, ${innerEl.scrollHeight}) - (${containerEl.clientWidth}, ${containerEl.clientHeight})`
      );
    }

    /**
     * `>=` rather than `>` to support ellipsis
     *
     * Required style on parent:
     *
     * ```css
     * display: flex;
     * align-items: 'start'
     * ```
     */
    while (
      innerEl.scrollWidth >= containerEl.clientWidth &&
      fontSizePx > minFontSizePx
    ) {
      fontSizePx -= delta;
      innerEl.style.fontSize = `${fontSizePx}px`;
      console.log(
        "singleline, looping down",
        fontSizePx,
        `(${innerEl.scrollWidth}, ${innerEl.scrollHeight}) - (${containerEl.clientWidth}, ${containerEl.clientHeight})`
      );
    }
  } else {
    /**
     * Multiline has more edge cases than single line.
     *
     * Must use `>=` rather than `>` since the element `innerEl` can have
     * `innerEl.scrollWidth === containerEl.scrollWidth` even though there is
     * room for resizing.
     */
    while (
      innerEl.scrollWidth <= containerEl.clientWidth &&
      innerEl.scrollHeight <= containerEl.clientHeight &&
      fontSizePx < maxFontSizePx
    ) {
      fontSizePx += delta;
      innerEl.style.fontSize = `${fontSizePx}px`;
      // console.log(
      //   "multiline, looping up",
      //   fontSizePx,
      //   `(${innerEl.scrollWidth}, ${innerEl.scrollHeight}) - (${containerEl.clientWidth}, ${containerEl.clientHeight})`
      // );
    }

    // Must use `>` rather than `>=` since the width can be max for long text,
    // wich would case the loop to run until minFontSize is reached
    while (
      (innerEl.scrollWidth > containerEl.clientWidth ||
        innerEl.scrollHeight > containerEl.clientHeight) &&
      fontSizePx > minFontSizePx
    ) {
      fontSizePx -= delta;
      innerEl.style.fontSize = `${fontSizePx}px`;
      // console.log(
      //   "multiline, looping down",
      //   fontSizePx,
      //   `(${innerEl.scrollWidth}, ${innerEl.scrollHeight}) - (${containerEl.clientWidth}, ${containerEl.clientHeight})`
      // );
    }
  }
}

export function AutoFitText({
  children,
  multiline,
  maxFontSizePx,
  minFontSizePx,
  ...rest
}: Props &
  DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >): ReactElement {
  const ref = useRef<HTMLInputElement>(null);

  const run = useMemo(() => {
    console.log("XXX");
    return throttle(() =>
      autoFitText({
        innerEl: ref.current,
        multiline,
        maxFontSizePx,
        minFontSizePx,
      })
    );
  }, [maxFontSizePx, minFontSizePx, multiline]);

  useEffect(run, [children, run]);

  useEffect(() => {
    window.addEventListener("resize", run);
    return () => window.removeEventListener("resize", run);
  }, [run]);

  return (
    <div ref={ref} {...rest}>
      {children}
    </div>
  );
}
