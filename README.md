# AutoTextSize

Make text fit container, prevent overflow and underflow.

The algorithm adjusts the font size of the text so that it precisely fills its container. It uses computed width and height so it works for all types of fonts.

## Single-line mode

The text fills the width of the container, without wrapping to more than one line.

<img src="./assets/single-line.gif" width="300" />

## Multi-line mode

The text fills both the width and the height of the container, allowing wrapping to multiple lines.

<img src="./assets/multi-line.gif" width="300" />

[**Live demo**](TODO)

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

### `AutoTextSize` Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `multiline` | `boolean` | `false` | Allow text to wrap to multiple lines. |
| `minFontSizePx` | `number` | `8` | The minimum font size to be used. |
| `maxFontSizePx` | `number` | `160` | The maximum font size to be used. |
| `fontSizePrecisionPx` | `number` | `0.1` | The algorithm stops when reaching the precision. |
| `as` | `string \| ReactComponent` | `'div'` | The underlying component that `AutoTextSize` will use. |

## Vanilla function

Zero dependencies.

```ts
import { autoTextSize } from 'auto-text-size'

// autoTextSize runs the returned function directly and
// re-runs it when the container element changes size.
const updateTextSize = autoTextSize(options)

// All invocations are throttled for performance. Manually
// call this if the content changes and needs to re-adjust.
updateTextSize()

// Disconnect the resize observer when done.
updateTextSize.disconnect()
```

One-off use:

```ts
import { updateTextSize } from 'auto-text-size'

updateTextSize(options)
```

### `autoTextSize` options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `innerEl` | `HTMLElement` | | The inner element to be auto sized. |
| `containerEl` | `HTMLElement` | | The container element defines the dimensions. |
| `multiline` | `boolean` | `false` | Allow text to wrap to multiple lines. |
| `minFontSizePx` | `number` | `8` | The minimum font size to be used. |
| `maxFontSizePx` | `number` | `160` | The maximum font size to be used. |
| `fontSizePrecisionPx` | `number` | `0.1` | The algorithm stops when reaching the precision. |

## Details

* **The single-line algorithm** predicts how the browser will render text in a different font size and iterates until converging within `fontSizePrecisionPx` (usually 1-2 iterations).
* **The multi-line algorithm** performs a binary search among the possible font sizes until converging within `fontSizePrecisionPx` (usually ~10 iterations). There is no reliable way of predicting how the browser will render text in a different font size when multi-line text wrap is at play.
* **Performance** Each iteration has a performance hit. `requestAnimationFrame` is used to throttle repeated calls. In this way we render as often as possible without excessively blocking the UI.
* **No overflow**. After usual iteration, the algorithms runs a second loop to ensure that no overflow occurs. Underflow is preferred since it doesn't look visually broken like overflow does.
* **Font size** is used rather than transform scale since the latter wouldn't support multi-line text wrap. Transform scale would work for single-line but we prefer to keep the two modes similar. Furthermore, transform scale tends to make text blurry in some browsers.

## Developing

When developing one typically wants to see the output in the example application without having to publish and install. We achieve this by linking the local package into the example app.

Because of [issues with `yarn link`](https://github.com/facebook/react/issues/14257), we use [Yalc](https://github.com/wclr/yalc). A linking approach is preferred over yarn workspaces since we want to use the package as it would appear in the real world.

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
# Bump version number
yarn clean && yarn build
npm publish
```
