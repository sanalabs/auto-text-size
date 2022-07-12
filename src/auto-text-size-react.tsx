import React, {
  DetailedHTMLProps,
  HTMLAttributes,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { autoTextSize, Options } from "./auto-text-size-standalone";

/**
 * Make text fit container, prevent overflow and underflow.
 */
export function AutoTextSize({
  multiline,
  minFontSizePx,
  maxFontSizePx,
  fontSizePrecisionPx,
  as: Comp = "div", // TODO: The `...rest` props are not typed to reflect another `as`.
  children,
  ...rest
}: Options & {
  as?: string | React.ComponentType<any>;
} & DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >): ReactElement {
  const updateTextSizeRef = useRef<ReturnType<typeof autoTextSize>>();

  useEffect(() => updateTextSizeRef.current?.(), [children]);

  const refCallback = useCallback(
    (innerEl: HTMLElement | null) => {
      updateTextSizeRef.current?.disconnect();

      const containerEl = innerEl?.parentElement;
      if (!innerEl || !containerEl) return;

      updateTextSizeRef.current = autoTextSize({
        innerEl,
        containerEl,
        multiline,
        minFontSizePx,
        maxFontSizePx,
        fontSizePrecisionPx,
      });
    },
    [multiline, minFontSizePx, maxFontSizePx, fontSizePrecisionPx]
  );

  return (
    <Comp ref={refCallback} {...rest}>
      {children}
    </Comp>
  );
}