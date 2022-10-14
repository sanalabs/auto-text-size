# AutoTextSize

Make text fit container, prevent overflow and underflow.

The font size of the text is adjusted so that it precisely fills its container. It uses computed width and height so it works for all types of fonts and automatically re-runs when the element resizes.

[**Live demo.**](https://stackblitz.com/github/sanalabs/auto-text-size/tree/main/example?file=pages%2Findex.tsx)

## Oneline mode

The text fills the width of the container, without wrapping to multiple lines.

<img src="https://raw.githubusercontent.com/sanalabs/auto-text-size/main/example/imgs/oneline-mode.gif" width="300" />

## Multiline mode

The text fills the width of the container, wrapping to multiple lines if necessary.

<!-- <img src="https://raw.githubusercontent.com/sanalabs/auto-text-size/main/example/imgs/multiline-mode.gif" width="300" /> -->

## Box mode

The text fills both the width and the height of the container, allowing wrapping to multiple lines.

<img src="https://raw.githubusercontent.com/sanalabs/auto-text-size/main/example/imgs/box-mode.gif" width="300" />

## React component

The `AutoTextSize` component automatically re-runs when `children` changes and when the element resizes.

```tsx
import { AutoTextSize } from 'auto-text-size'

export const Title = ({ text }) => {
  return (
    <div style={{ maxWidth: '60%', margin: '0 auto' }}>
      <AutoTextSize>{text}</AutoTextSize>
    </div>
  )
}
```

### `AutoTextSize` props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `mode` | `'oneline' \|  'multiline' \| 'box` | `'multiline'` | Determine how text will wrap. |
| `minFontSizePx` | `number` | `8` | The minimum font size to be used. |
| `maxFontSizePx` | `number` | `160` | The maximum font size to be used. |
| `fontSizePrecisionPx` | `number` | `0.1` | The algorithm stops when reaching the precision. |
| `as` | `string \| ReactComponent` | `'div'` | The underlying component that `AutoTextSize` will use. |

## Vanilla function

Zero dependencies.

```ts
import { autoTextSize } from 'auto-text-size'

// autoTextSize runs the returned function directly and
// re-runs it when the container element resize.
const updateTextSize = autoTextSize(options)

// All invocations are throttled for performance. Manually
// call this if the content changes and needs to re-adjust.
updateTextSize()

// Disconnect the resize observer when done.
updateTextSize.disconnect()
```

One-off:

```ts
import { updateTextSize } from 'auto-text-size'

updateTextSize(options)
```

### `autoTextSize` options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `innerEl` | `HTMLElement` | | The inner element to be auto sized. |
| `containerEl` | `HTMLElement` | | The container element defines the dimensions. |
| `mode` | `'oneline' \|  'multiline' \| 'box` | `'multiline'` | Determine how text will wrap. |
| `minFontSizePx` | `number` | `8` | The minimum font size to be used. |
| `maxFontSizePx` | `number` | `160` | The maximum font size to be used. |
| `fontSizePrecisionPx` | `number` | `0.1` | The algorithm stops when reaching the precision. |

## Details

* **The single-line algorithm** predicts how the browser will render text in a different font size and iterates until converging within `fontSizePrecisionPx` (usually 1-2 iterations).
* **The multi-line algorithm** performs a binary search among the possible font sizes until converging within `fontSizePrecisionPx` (usually ~10 iterations). There is no reliable way of predicting how the browser will render text in a different font size when multi-line text wrap is at play.
* **Performance.** Each iteration has a performance hit since it triggers a [layout reflow](https://developer.mozilla.org/en-US/docs/Web/Performance/Critical_rendering_path#layout). Multiple mesures are taken to minimize the performance impact. As few iterations as possible are executed, throttling is performed using [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) and [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) is used to recompute text size only when needed.
* **No overflow**. After converging, the algorithm runs a second loop to ensure that no overflow occurs. Underflow is preferred since it doesn't look visually broken like overflow does. Some browsers (eg. Safari) are not good with sub-pixel font sizing, making it so that significant visual overflow can occur unless we adjust for it.
* **Font size** is used rather than the [scale() CSS function](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/scale) since it is simple and works very well. The the scale() function wouldn't support multi-line text wrap and it tends to make text blurry in some browsers.

## Developing

When developing one typically wants to see the output in the example application without having to publish and reinstall. This is achieved by linking the local package into the example app.

Because of [issues with `yarn link`](https://github.com/facebook/react/issues/14257), [Yalc](https://github.com/wclr/yalc) is used instead. A linking approach is preferred over yarn workspaces since we want to use the package as it would appear in the real world.

```sh
npm i yalc -g
yarn
yarn watch

# Other terminal
cd example
yarn
yalc link auto-text-size
yarn dev
```

### Yalc and HMR

Using `yalc link` (or `yalc add--link`) makes it so that Next.js HMR detects updates instantly.

### Publishing

```sh
# Update version number
yarn clean && yarn build
npm publish
```
