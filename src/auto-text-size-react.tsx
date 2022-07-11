import React, {
  DetailedHTMLProps,
  HTMLAttributes,
  ReactElement,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  autoTextSizeWithResizeObserver,
  Options,
} from "./auto-text-size-standalone";

/**
 * Make text fit container, prevent overflow and underflow.
 */
export function AutoTextSize({
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
  const funcRef = useRef<ReturnType<typeof autoTextSizeWithResizeObserver>>();

  useEffect(() => funcRef.current?.(), [children]);

  const refCallback = useCallback(
    (innerEl: HTMLElement | null) => {
      funcRef.current?.disconnect();

      const containerEl = innerEl?.parentElement;
      if (!innerEl || !containerEl) return;

      funcRef.current = autoTextSizeWithResizeObserver({
        innerEl,
        containerEl,
        multiline,
        maxFontSizePx,
        minFontSizePx,
      });
    },
    [maxFontSizePx, minFontSizePx, multiline]
  );

  return (
    <Comp ref={refCallback} {...rest}>
      {children}
    </Comp>
  );
}
