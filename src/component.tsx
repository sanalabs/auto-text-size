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
}: Options & {
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
