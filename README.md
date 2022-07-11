# AutoTextSize

Make text fit container, prevent overflow and underflow.

The algorithm adjusts the font size of the text so that it precisely fills its container. It uses computed width and height so it works for all types of fonts.

## Single-line mode

Text fills the width of the container, without wrapping to more than one line.

<img src="./assets/single-line.gif" width="300" />

## Multi-line mode

Text fills both the width and the height of the container, allowing wrapping to multiple lines.

<img src="./assets/multi-line.gif" width="300" />

[**Live demo**](TODO)

## React component `AutoTextSize`

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
| `children` | `ReactNode` | | The content to be auto sized. |
| `multiline` | `boolean` | `false` | Allow text to wrap and fill container width and height. |
| `minFontSizePx` | `number` | `8` | The smallest font size the algorithm will use. |
| `maxFontSizePx` | `number` | `160` | The largest font size the algorithm will use. |
| `as` | `string \| ReactComponent` | `'div'` | The underlying component that `AutoTextSize` will use. |

## Low-level `autoTextSize` function

For advanced use cases, the `autoTextSize` and `autoTextSizeWithResizeObserver` function may be useful. The latter is used by the `AutoTextSize` component and has no dependencies.

Simple:

```ts
import { autoTextSize } from 'auto-text-size'

autoTextSize(options)
```

Robust:

```ts
import { autoTextSizeWithResizeObserver } from 'auto-text-size'

const func = autoTextSizeWithResizeObserver(options)

func()
// Subsequent calls are throttled for performance and
// it automatically re-runs if the element resizes.

func.disconnect() // Disconnect the resize observer when done.
```

### `autoTextSize` options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `innerEl` | `HTMLElement` | | The inner element to be auto sized. |
| `containerEl` | `HTMLElement` | | The container element is used as bounding box for the inner element. |
| `multiline` | `boolean` | `false` | Allow text to wrap and fill container width and height. |
| `minFontSizePx` | `number` | `8` | The smallest font size the algorithm will use. |
| `maxFontSizePx` | `number` | `160` | The largest font size the algorithm will use. |

## Details

* **The single-line algorithm** predicts how the browser will render text in a different font size and iterates until converging with an error of <= 0.1px (usually 1-2 iterations).
* **The multi-line algorithm** performs a binary search among the possible font sizes until converging with an error of <= 0.1px (usually ~10 iterations). There is no reliable way of predicting how the browser will render text in a different font size when multi-line text wrap is at play.
* **Performance** Each iteration has a performance hit. `AutoTextSize` uses `requestAnimationFrame` to throttle repeated calls, ensuring that we render as often as possible without excessively blocking the UI.
* **No overflow**. After usual iteration, the algorithms runs a second loop to ensure that no overflow occurs. Underflow is preferred since it doesn't look visually broken like overflow does.
* **Font size** is used rather than transform scale since the latter wouldn't support multi-line text wrap. Transform scale would work for singleline but we prefer to keep the two modes similar. Furthermore, transform scale tends to make text blurry in some browsers.

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

Using `yalk link` (or `yalc add--link`) makes it so that Next.js HMR detects updates instantly.

### Publishing

```sh
# Bump version number
yarn clean && yarn build
npm publish
```
