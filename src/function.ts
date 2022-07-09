import { CSSProperties } from "react";

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
  let updatePx: number | undefined = undefined;

  while (iterCount < maxIterCount) {
    const w0 = innerEl.scrollWidth;
    const w1 = containerEl.clientWidth;

    const canGrow = fontSizePx < maxFontSizePx && w0 < w1;
    const canShrink = fontSizePx > minFontSizePx && w0 > w1;

    const overflowFactor = w0 / w1;

    // console.log({ w0, w1, canGrow, canShrink, overflowFactor })

    // The browser cannot render a difference based on the previous font size update
    if (prevOverflowFactor === overflowFactor) {
      break;
    }

    if (!(canGrow || canShrink)) {
      break;
    }

    updatePx = fontSizePx / overflowFactor - fontSizePx;
    // console.log(updatePx);
    const prevFontSizePx = fontSizePx;
    fontSizePx = updateFontSizePx(fontSizePx + updatePx);

    // Stop iterating when converging
    if (Math.abs(fontSizePx - prevFontSizePx) < 0.1) {
      // console.log(`Update size converged (${fontSizePx - prevFontSizePx})`);
      break;
    }

    prevOverflowFactor = overflowFactor;
    iterCount++;
  }

  // Ensure no overflow. Some browsers (Safari) are not great with sub-pixel
  // font size, making it so that the overflow can be rather bad.
  const overflowStepSize = Math.max(updatePx ?? 0.1, 0.1);
  while (fontSizePx > minFontSizePx) {
    const w0 = innerEl.scrollWidth;
    const w1 = containerEl.clientWidth;
    if (w0 <= w1) break;

    console.log("Anti-overflow", overflowStepSize);
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
  const maxIterCount = 10;
  let iterCount = 0;
  let prevOverflowFactor = 1;
  let updatePx: number | undefined = undefined;

  while (iterCount < maxIterCount) {
    const w0 = innerEl.scrollWidth;
    const w1 = containerEl.clientWidth;

    const h0 = innerEl.scrollHeight;
    const h1 = containerEl.clientHeight;

    const wCanGrow = fontSizePx < maxFontSizePx && w0 < w1;
    const wCanShrink = fontSizePx > minFontSizePx && w0 > w1;

    const hCanGrow = fontSizePx < maxFontSizePx && h0 < h1;
    const hCanShrink = fontSizePx > minFontSizePx && h0 > h1;

    // const wOverflowFactor = w0 / w1;
    // const hOverflowFactor = h0 / h1;

    const wErr = w0 / w1
    const hErr = h0 / h1

    // const err = (w1 - w0) * h1 + (h1 - h0) * w1
    // const factor = err / (w1 * h1)
    const factor = wErr * hErr

    // console.log({ w0, w1, canGrow, canShrink, overflowFactor })

    // The browser cannot render a difference based on the previous font size update
    // if (prevOverflowFactor === wOverflowFactor) {
    //   break;
    // }

    if (!(wCanGrow || wCanShrink || hCanGrow || hCanShrink)) {
      break;
    }

    updatePx = fontSizePx / factor - fontSizePx;

    console.log({fontSizePx, factor, wErr, hErr })

    const prevFontSizePx = fontSizePx;
    fontSizePx = updateFontSizePx(fontSizePx + updatePx);

    // Stop iterating when converging
    if (Math.abs(fontSizePx - prevFontSizePx) < 0.1) {
      // console.log(`Update size converged (${fontSizePx - prevFontSizePx})`);
      break;
    }

    // prevOverflowFactor = wOverflowFactor;
    iterCount++;
  }

  // Ensure no overflow. Some browsers (Safari) are not great with sub-pixel
  // font size, making it so that the overflow can be rather bad.
  // const overflowStepSize = Math.max(updatePx ?? 0.1, 0.1);
  // while (fontSizePx > minFontSizePx) {
  //   const w0 = innerEl.scrollWidth;
  //   const w1 = containerEl.clientWidth;

  //   const h0 = innerEl.scrollHeight;
  //   const h1 = containerEl.clientHeight;

  //   const wOverflowFactor = w0 / w1;
  //   const hOverflowFactor = h0 / h1;

  //   if (w0 <= w1 && h0 <= h1) break;

  //   console.log("Anti-overflow", wOverflowFactor, hOverflowFactor, overflowStepSize);
  //   fontSizePx = updateFontSizePx(fontSizePx - overflowStepSize);
  // }
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
  maxFontSizePx = 200,
}: Options & {
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

  const containerStyles: CSSProperties = {
    // This allows proper computation of the dimensions `innerEl`.
    display: "flex",
    alignItems: "start",
  };

  const innerStyles: CSSProperties = {
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

  const fontSizeAdjustmentFactor = 1.05;

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

  if (!multiline) {
    singlelineAlgo({
      innerEl,
      containerEl,
      fontSizePx,
      minFontSizePx,
      maxFontSizePx,
      updateFontSizePx,
    });
  } else {
    multilineAlgo({
      innerEl,
      containerEl,
      fontSizePx,
      minFontSizePx,
      maxFontSizePx,
      updateFontSizePx,
    });

    // /**
    //  * Multiline has more edge cases than single line.
    //  *
    //  * Must use `>=` rather than `>` since the element `innerEl` can have
    //  * `innerEl.scrollWidth === containerEl.scrollWidth` even though there is
    //  * room for resizing.
    //  */
    // while (
    //   innerEl.scrollWidth <= containerEl.clientWidth &&
    //   innerEl.scrollHeight <= containerEl.clientHeight &&
    //   fontSizePx < maxFontSizePx
    // ) {
    //   updateFontSizePx(fontSizePx * fontSizeAdjustmentFactor);
    // }

    // // Must use `>` rather than `>=` since the width can be max for long text,
    // // wich would case the loop to run until minFontSize is reached
    // while (
    //   (innerEl.scrollWidth > containerEl.clientWidth ||
    //     innerEl.scrollHeight > containerEl.clientHeight) &&
    //   fontSizePx > minFontSizePx
    // ) {
    //   updateFontSizePx(fontSizePx / fontSizeAdjustmentFactor);
    // }
  }

  console.debug(`AutoFit ran ${iterations} iterations`);
}
