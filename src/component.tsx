import React, {
  DetailedHTMLProps,
  HTMLAttributes,
  ReactElement,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { autoFit, Options } from "./function";

/**
 * Ensures that `func` is not called more than once per animation frame.
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
    } else {
      console.debug("AutoFit throttling to next animation frame");
    }
  };
}

/**
 * Adjusts the font size so that the content fits its container.
 */
export function AutoFit({
  multiline,
  maxFontSizePx,
  minFontSizePx,
  as: Comp = "div", // TODO: The `...rest` props are not typed to reflect another `as`.
  children,
  ...rest
}: Options & {
  as?: string | React.ComponentType<any>;
} & DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >): ReactElement {
  const ref = useRef<HTMLInputElement>(null);

  const throttledAutoFit = useMemo(
    () =>
      throttleToNextFrame(() =>
        autoFit({
          innerEl: ref.current,
          containerEl: ref.current?.parentElement,
          multiline,
          maxFontSizePx,
          minFontSizePx,
        })
      ),
    [maxFontSizePx, minFontSizePx, multiline]
  );

  useEffect(throttledAutoFit, [children, throttledAutoFit]);

  useEffect(() => {
    window.addEventListener("resize", throttledAutoFit);
    return () => window.removeEventListener("resize", throttledAutoFit);
  }, [throttledAutoFit]);

  return (
    <Comp ref={ref} {...rest}>
      {children}
    </Comp>
  );
}
