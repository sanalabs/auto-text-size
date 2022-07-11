/**
 * Ensures that `func` is not called more than once per animation frame.
 *
 * Using requestAnimationFrame in this way ensures that we render as often as
 * possible without excessively blocking the UI.
 */
function throttleAnimationFrame(func: () => void): () => void {
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

type AlgoOpts = {
  innerEl: HTMLElement;
  containerEl: HTMLElement;
  fontSizePx: number;
  minFontSizePx: number;
  maxFontSizePx: number;
  fontSizePrecisionPx: number;
  updateFontSizePx: (px: number) => number;
};

/**
 * Ensure no overflow. Underflow is preferred since it doesn't look visually
 * broken like overflow does.
 *
 * Some browsers (Safari) are not good with sub-pixel font sizing, making it so
 * that visual overflow can occur unless we adjust for it.
 */
const antiOverflowAlgo = ({
  fontSizePx,
  minFontSizePx,
  fontSizePrecisionPx,
  updateFontSizePx,
  breakPredicate: breakPred,
}: Pick<
  AlgoOpts,
  "fontSizePx" | "minFontSizePx" | "fontSizePrecisionPx" | "updateFontSizePx"
> & { breakPredicate: () => boolean }): void => {
  const maxIterCount = 1 / fontSizePrecisionPx;
  let iterCount = 0;

  while (fontSizePx > minFontSizePx && iterCount < maxIterCount) {
    if (breakPred()) break;
    fontSizePx = updateFontSizePx(fontSizePx - fontSizePrecisionPx);
    iterCount++;
  }
};

const getContentWidth = (element: HTMLElement): number => {
  const computedStyle = getComputedStyle(element);
  return (
    element.clientWidth -
    parseFloat(computedStyle.paddingLeft) -
    parseFloat(computedStyle.paddingRight)
  );
};

const getContentHeight = (element: HTMLElement): number => {
  const computedStyle = getComputedStyle(element);
  return (
    element.clientHeight -
    parseFloat(computedStyle.paddingTop) -
    parseFloat(computedStyle.paddingBottom)
  );
};

const singlelineAlgo = ({
  innerEl,
  containerEl,
  fontSizePx,
  minFontSizePx,
  maxFontSizePx,
  fontSizePrecisionPx,
  updateFontSizePx,
}: AlgoOpts): void => {
  const maxIterCount = 10; // Safety fallback to avoid infinite loop
  let iterCount = 0;
  let prevOverflowFactor = 1;

  while (iterCount < maxIterCount) {
    const w0 = innerEl.scrollWidth;
    const w1 = getContentWidth(containerEl);

    const canGrow = fontSizePx < maxFontSizePx && w0 < w1;
    const canShrink = fontSizePx > minFontSizePx && w0 > w1;

    const overflowFactor = w0 / w1;

    // The browser cannot render a difference based on the previous font size update
    if (prevOverflowFactor === overflowFactor) {
      break;
    }

    if (!(canGrow || canShrink)) {
      break;
    }

    const updatePx = fontSizePx / overflowFactor - fontSizePx;
    const prevFontSizePx = fontSizePx;
    fontSizePx = updateFontSizePx(fontSizePx + updatePx);

    // Stop iterating when converging
    if (Math.abs(fontSizePx - prevFontSizePx) <= fontSizePrecisionPx) {
      break;
    }

    prevOverflowFactor = overflowFactor;
    iterCount++;
  }

  antiOverflowAlgo({
    fontSizePx,
    minFontSizePx,
    updateFontSizePx,
    fontSizePrecisionPx,
    breakPredicate: () => innerEl.scrollWidth <= getContentWidth(containerEl),
  });
};

const multilineAlgo = ({
  innerEl,
  containerEl,
  fontSizePx,
  minFontSizePx,
  maxFontSizePx,
  fontSizePrecisionPx,
  updateFontSizePx,
}: AlgoOpts) => {
  const maxIterCount = 100; // Safety fallback to avoid infinite loop
  const decayFactor = 0.5; // Binary search. Don't change this number.
  let updatePx = maxFontSizePx - minFontSizePx;
  let iterCount = 0;

  while (updatePx > fontSizePrecisionPx && iterCount < maxIterCount) {
    const w0 = innerEl.scrollWidth;
    const w1 = getContentWidth(containerEl);

    const h0 = innerEl.scrollHeight;
    const h1 = getContentHeight(containerEl);

    if (w0 === w1 && h0 === h1) break;

    updatePx *= decayFactor; // The first jump should be 50% of the total distance.

    /**
     * Use `<=` rather than `<` since equality is possible even though there is
     * room for resizing in the other dimension.
     */
    if (fontSizePx < maxFontSizePx && w0 <= w1 && h0 <= h1) {
      fontSizePx = updateFontSizePx(fontSizePx + updatePx);
    } else if (fontSizePx > minFontSizePx && (w0 > w1 || h0 > h1)) {
      fontSizePx = updateFontSizePx(fontSizePx - updatePx);
    }

    iterCount++;
  }

  antiOverflowAlgo({
    fontSizePx,
    minFontSizePx,
    updateFontSizePx,
    fontSizePrecisionPx,
    breakPredicate: () =>
      innerEl.scrollWidth <= getContentWidth(containerEl) &&
      innerEl.scrollHeight <= getContentHeight(containerEl),
  });
};

export type Options = {
  multiline?: boolean | undefined;
  minFontSizePx?: number | undefined;
  maxFontSizePx?: number | undefined;
  fontSizePrecisionPx?: number | undefined;
};

/**
 * Make text fit container, prevent overflow and underflow.
 *
 * Adjusts the font size of `innerEl` so that it precisely fills `containerEl`.
 */
export function updateTextSize({
  innerEl,
  containerEl,
  multiline,
  minFontSizePx = 8,
  maxFontSizePx = 160,
  fontSizePrecisionPx = 0.1,
}: Options & {
  innerEl: HTMLElement;
  containerEl: HTMLElement;
}): void {
  const t0 = performance.now();

  if (!isFinite(minFontSizePx)) {
    throw new Error(`Invalid minFontSizePx (${minFontSizePx})`);
  }

  if (!isFinite(minFontSizePx)) {
    throw new Error(`Invalid maxFontSizePx (${maxFontSizePx})`);
  }

  if (!isFinite(fontSizePrecisionPx) || fontSizePrecisionPx === 0) {
    throw new Error(`Invalid fontSizePrecisionPx (${fontSizePrecisionPx})`);
  }

  if (containerEl.children.length > 1) {
    console.warn(
      `AutoTextSize has ${
        containerEl.children.length - 1
      } siblings. This may interfere with the algorithm.`
    );
  }

  const containerStyles: Partial<CSSStyleDeclaration> = {
    // Necessary to correctly compute the dimensions `innerEl`.
    display: "flex",
    alignItems: "start",
  };

  const innerStyles: Partial<CSSStyleDeclaration> = {
    display: "block", // Necessary to compute dimensions.
  };

  if (multiline) {
    innerStyles.whiteSpace = "pre-wrap";
    innerStyles.wordBreak = "normal";
    innerStyles.hyphens = "none";
    innerStyles.overflowWrap = "break-word";
  } else {
    innerStyles.whiteSpace = "nowrap";
    innerStyles.overflow = "visible"; // Because of subpixel rounding and finite iteration, we may overshoot by a small amount
  }

  Object.assign(containerEl.style, containerStyles);
  Object.assign(innerEl.style, innerStyles);

  const fontSizeStr = window
    .getComputedStyle(innerEl, null)
    .getPropertyValue("font-size");
  let fontSizePx = parseFloat(fontSizeStr);
  let iterations = 0;

  const updateFontSizePx = (px: number): number => {
    px = Math.min(Math.max(px, minFontSizePx), maxFontSizePx);
    // console.debug(
    //   `setFontSizePx ${px > fontSizePx ? "up" : "down"} (abs: ${
    //     px / fontSizePx
    //   }, rel: ${(px - fontSizePx) / fontSizePx}) ${px}`
    // );
    fontSizePx = px;
    innerEl.style.fontSize = `${fontSizePx}px`;
    iterations++;
    return fontSizePx;
  };

  if (fontSizePx > maxFontSizePx || fontSizePx < minFontSizePx) {
    updateFontSizePx(fontSizePx);
  }

  if (multiline) {
    multilineAlgo({
      innerEl,
      containerEl,
      fontSizePx,
      minFontSizePx,
      maxFontSizePx,
      fontSizePrecisionPx,
      updateFontSizePx,
    });
  } else {
    singlelineAlgo({
      innerEl,
      containerEl,
      fontSizePx,
      minFontSizePx,
      maxFontSizePx,
      fontSizePrecisionPx,
      updateFontSizePx,
    });
  }

  const t1 = performance.now();

  console.debug(
    `AutoTextSize ${
      multiline ? "multiline" : "singleline"
    } ran ${iterations} iterations in ${Math.round(t1 - t0)}ms`
  );
}

type DisconnectableFunction = {
  (): void;
  disconnect: () => void;
};

/**
 * Make text fit container, prevent overflow and underflow.
 *
 * Adjusts the font size of `innerEl` so that it precisely fills `containerEl`.
 *
 * Throttles all invocations to next animation frame (through
 * `requestAnimationFrame`).
 *
 * Sets up a `ResizeObserver` to automatically run `autoTextSize` when
 * `containerEl` resizes. Call `disconnect()` when done to disconnect the resize
 * observer to prevent memory leaks.
 */
export function autoTextSize({
  innerEl,
  containerEl,
  multiline,
  minFontSizePx,
  maxFontSizePx,
  fontSizePrecisionPx,
}: Options & {
  innerEl: HTMLElement;
  containerEl: HTMLElement;
}): DisconnectableFunction {
  // Initialize as `undefined` to always run directly when instantiating.
  let containerDimensions: [number, number] | undefined = undefined;

  // Use type `any` so that we can add the `.disconnect` property later on.
  const throttledUpdateTextSize: any = throttleAnimationFrame(() => {
    updateTextSize({
      innerEl,
      containerEl,
      multiline,
      maxFontSizePx,
      minFontSizePx,
      fontSizePrecisionPx,
    });

    containerDimensions = [
      getContentWidth(containerEl),
      getContentHeight(containerEl),
    ];
  });

  const resizeObserver = new ResizeObserver(() => {
    const prevContainerDimensions = containerDimensions;
    containerDimensions = [
      getContentWidth(containerEl),
      getContentHeight(containerEl),
    ];

    if (
      prevContainerDimensions?.[0] !== containerDimensions[0] ||
      prevContainerDimensions?.[1] !== containerDimensions[1]
    ) {
      throttledUpdateTextSize();
    }
  });

  // It calls the callback directly.
  resizeObserver.observe(containerEl);

  // The native code `resizeObserver.disconnect` needs the correct context.
  // Retain the context by wrapping in arrow function. Read more about this:
  // https://stackoverflow.com/a/9678166/19306180
  throttledUpdateTextSize.disconnect = () => resizeObserver.disconnect();

  return throttledUpdateTextSize;
}
