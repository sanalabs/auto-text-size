type AlgoOpts = {
  innerEl: HTMLElement;
  containerEl: HTMLElement;
  fontSizePx: number;
  minFontSizePx: number;
  maxFontSizePx: number;
  updateFontSizePx: (px: number) => number;
};

const singlelineAlgo = ({
  innerEl,
  containerEl,
  fontSizePx,
  minFontSizePx,
  maxFontSizePx,
  updateFontSizePx,
}: AlgoOpts) => {
  const maxIterCount = 10;
  let iterCount = 0;
  let prevOverflowFactor = 1;
  const precisionPx = 0.1;

  while (iterCount < maxIterCount) {
    const w0 = innerEl.scrollWidth;
    const w1 = containerEl.clientWidth;

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
    if (Math.abs(fontSizePx - prevFontSizePx) <= precisionPx) {
      break;
    }

    prevOverflowFactor = overflowFactor;
    iterCount++;
  }

  // Ensure no overflow. Some browsers (Safari) are not great with sub-pixel
  // font size, making it so that the overflow can be rather bad.
  const overflowStepSize = 0.1;
  while (fontSizePx > minFontSizePx) {
    const w0 = innerEl.scrollWidth;
    const w1 = containerEl.clientWidth;
    if (w0 <= w1) break;

    fontSizePx = updateFontSizePx(fontSizePx - overflowStepSize);
  }
};

const multilineAlgo = ({
  innerEl,
  containerEl,
  fontSizePx,
  minFontSizePx,
  maxFontSizePx,
  updateFontSizePx,
}: AlgoOpts) => {
  const decayFactor = 0.5; // Binary search. Don't change this number.
  const precisionPx = 0.1;
  let updatePx = maxFontSizePx - minFontSizePx;

  while (updatePx > precisionPx) {
    const w0 = innerEl.scrollWidth;
    const w1 = containerEl.clientWidth;

    const h0 = innerEl.scrollHeight;
    const h1 = containerEl.clientHeight;

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
  }

  // Ensure no overflow. Some browsers (Safari) are not great with sub-pixel
  // font size, making it so that the overflow can be rather bad.
  const overflowStepSize = 0.1;
  while (fontSizePx > minFontSizePx) {
    const w0 = innerEl.scrollWidth;
    const w1 = containerEl.clientWidth;

    const h0 = innerEl.scrollHeight;
    const h1 = containerEl.clientHeight;

    if (w0 <= w1 && h0 <= h1) break;

    fontSizePx = updateFontSizePx(fontSizePx - overflowStepSize);
  }
};

export type Options = {
  multiline?: boolean | undefined;
  minFontSizePx?: number | undefined;
  maxFontSizePx?: number | undefined;
};

/**
 * Adjusts the font size of `innerEl` so that it fits `containerEl`.
 */
export function autoFit({
  innerEl,
  containerEl,
  multiline,
  minFontSizePx = 8,
  maxFontSizePx = 160,
}: Options & {
  innerEl: HTMLElement | undefined | null;
  containerEl: HTMLElement | undefined | null;
}): void {
  const t0 = performance.now();

  if (!innerEl || !containerEl) return;

  if (containerEl.children.length > 1) {
    console.warn(
      `AutoSizeText has ${
        containerEl.children.length - 1
      } siblings. This may interfere with the auto-size algorithm.`
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

  if (multiline) {
    multilineAlgo({
      innerEl,
      containerEl,
      fontSizePx,
      minFontSizePx,
      maxFontSizePx,
      updateFontSizePx,
    });
  } else {
    singlelineAlgo({
      innerEl,
      containerEl,
      fontSizePx,
      minFontSizePx,
      maxFontSizePx,
      updateFontSizePx,
    });
  }

  const t1 = performance.now();

  console.debug(
    `AutoFit ${
      multiline ? "multiline" : "singleline"
    } ran ${iterations} iterations in ${Math.round(t1 - t0)}ms`
  );
}
