import {
  CSSProperties,
  DetailedHTMLProps,
  HTMLAttributes,
  ReactElement,
  useEffect,
  useMemo,
  useRef,
} from "react";

/**
 * Never call `func` more than once per animation frame.
 *
 * Using requestAnimationFrame in this way ensures that we render as often as
 * possible without excessively blocking the UI.
 */
function throttleToNextFrame(func: () => void): () => void {
  let wait = false;

  return () => {
    if (!wait) {
      wait = true;
      requestAnimationFrame(() => {
        func();
        wait = false;
      });
    }
  };
}

type Config = {
  multiline?: boolean;
  ellipsis?: boolean;
  minFontSizePx?: number;
  maxFontSizePx?: number;
};

/**
 * Adjust the font size of `innerEl` so that it doesn't overflow `containerEl`.
 */
export function autoFit({
  innerEl,
  containerEl,
  multiline,
  ellipsis,
  minFontSizePx = 8,
  maxFontSizePx = 200,
}: Config & {
  innerEl: HTMLElement | undefined | null;
  containerEl: HTMLElement | undefined | null;
}): void {
  if (!innerEl || !containerEl) return;

  if (containerEl.children.length > 1) {
    console.warn(
      `AutoSizeText has ${
        containerEl.children.length - 1
      } siblings. This may interfere with the auto-size algorithm.`
    );
  }

  // Add styling when necessary
  if (!multiline && ellipsis) {
    // This allows proper computation of the dimensions `innerEl`.
    containerEl.style.display = "flex";
    containerEl.style.alignItems = "start";
  }

  if (multiline) {
    innerEl.style.whiteSpace = "pre-wrap";
    innerEl.style.wordBreak = "normal";
    innerEl.style.hyphens = "none";
    innerEl.style.overflowWrap = "break-word";
  } else {
    innerEl.style.whiteSpace = "nowrap";
  }

  if (ellipsis) {
    innerEl.style.maxWidth = "100%";
    innerEl.style.textOverflow = "ellipsis";
    innerEl.style.overflow = "hidden";
  }

  const innerDisplay = window
    .getComputedStyle(innerEl, null)
    .getPropertyValue("display");

  if (innerDisplay !== "block") {
    innerEl.style.display = "block"; // Necessary to compute bounding box
  }

  if (innerEl.scrollWidth === 0 || innerEl.scrollHeight === 0) {
    return;
  }

  const fontSizeAdjustmentFactor = 1.05;

  const fontSizeStr = window
    .getComputedStyle(innerEl, null)
    .getPropertyValue("font-size");
  let fontSizePx = parseFloat(fontSizeStr);

  let iterations = 0;

  const setFontSizePx = (px: number): void => {
    fontSizePx = px;
    innerEl.style.fontSize = `${fontSizePx}px`;
    iterations++;
  };

  if (!multiline) {
    while (
      innerEl.scrollWidth <= containerEl.clientWidth &&
      fontSizePx < maxFontSizePx
    ) {
      setFontSizePx(fontSizePx * fontSizeAdjustmentFactor);
    }

    while (
      (ellipsis
        ? innerEl.scrollWidth >= containerEl.clientWidth
        : innerEl.scrollWidth > containerEl.clientWidth) &&
      fontSizePx > minFontSizePx
    ) {
      setFontSizePx(fontSizePx / fontSizeAdjustmentFactor);
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
      setFontSizePx(fontSizePx * fontSizeAdjustmentFactor);
    }

    // Must use `>` rather than `>=` since the width can be max for long text,
    // wich would case the loop to run until minFontSize is reached
    while (
      (innerEl.scrollWidth > containerEl.clientWidth ||
        innerEl.scrollHeight > containerEl.clientHeight) &&
      fontSizePx > minFontSizePx
    ) {
      setFontSizePx(fontSizePx / fontSizeAdjustmentFactor);
    }
  }

  // The above loops can overshoot. Adjust for this. This is better than
  // stopping the loops one iteration earlier, because then we wouldn't get all
  // the way to the limit. Adjusting the setp size based on how close we are to
  // the limit is messier than this.
  if (fontSizePx < minFontSizePx) {
    setFontSizePx(minFontSizePx);
  }

  if (fontSizePx > maxFontSizePx) {
    setFontSizePx(maxFontSizePx);
  }

  // Each iteration is a performance hit. There is room for improving the
  // algorithm. Currently it is doing a simple linear search. Binary search is
  // not necessarily better since the linear search will require fewer steps in
  // most cases when the text is being written by the user,
  // character-by-character. Ideally the algorithm would guesses the required
  // updated based on the measured dimensions.
  console.debug(`AutoFit executed with ${iterations} iterations`);
}

/**
 * React component wrapping `autoFit` for ease of use.
 *
 * ```jsx
 * <AutoFit>{text}</AutoFit>
 * ```
 */
export function AutoFit({
  multiline,
  ellipsis,
  maxFontSizePx,
  minFontSizePx,
  as: Comp = "div", // TODO: The `...rest` props are not typed to reflect another `as`.
  children,
  ...rest
}: Config & {
  as?: string | React.ComponentType<any>;
} & DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >): ReactElement {
  const ref = useRef<HTMLInputElement>(null);

  const throttledAutoFitText = useMemo(() => {
    return throttleToNextFrame(() =>
      autoFit({
        innerEl: ref.current,
        containerEl: ref.current?.parentElement,
        multiline,
        ellipsis,
        maxFontSizePx,
        minFontSizePx,
      })
    );
  }, [ellipsis, maxFontSizePx, minFontSizePx, multiline]);

  useEffect(throttledAutoFitText, [children, throttledAutoFitText]);

  useEffect(() => {
    window.addEventListener("resize", throttledAutoFitText);
    return () => window.removeEventListener("resize", throttledAutoFitText);
  }, [throttledAutoFitText]);

  return (
    <Comp ref={ref} {...rest}>
      {children}
    </Comp>
  );
}
