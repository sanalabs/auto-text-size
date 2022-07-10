# AutoFit

Automatically fit text into its container, preventing overflow and underflow.

The algorithm uses computed width and height and therefore works for all font types and variations. It adjusts the font size of a given element so that it precisely fills its container. Not only text, it works for any elements with dimensions defined relative to font size (eg. `width: 1em`).

<img src="./assets/multi-line.gif" width="300" />
<img src="./assets/single-line.gif" width="300" />

[**Live demo**](TODO)

## React component `AutoFit`

The `AutoFit` component automatically re-runs when `children` changes and when the viewport resizes.

```tsx
import { AutoFit } from 'auto-fit'

export const Title = ({ text }) => {
  return (
    <div style={{ maxWidth: '60%', margin: '0 auto' }}>
      <AutoFit>{text}</AutoFit>
    </div>
  )
}
```

### `AutoFit` Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | | The content to be auto fitted. |
| `multiline` | `boolean` | `false` | Allow text to wrap and fit into both container width and height. |
| `minFontSizePx` | `number` | `8` | The smallest font size the algorithm will use. |
| `maxFontSizePx` | `number` | `160` | The largest font size the algorithm will use. |
| `as` | `string \| ReactComponent` | `'div'` | The underlying component that `AutoFit` will use. |

## Low-level `autoFit` function

For advanced use cases, the `autoFit` function may be useful. It is used by the `AutoFit` component and has no dependencies.

```ts
import { autoFit } from 'auto-fit'

autoFit(options)
```

### `autoFit` options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `innerEl` | `HTMLElement` | | The inner element to be auto fitted. |
| `containerEl` | `HTMLElement` | | The container element is used as bounding box for the inner element. |
| `minFontSizePx` | `number` | `8` | The smallest font size the algorithm will use. |
| `maxFontSizePx` | `number` | `160` | The largest font size the algorithm will use. |

## Details

* **The single-line algorithm** predicts how the browser will render text in a different font size and iterates until converging with an error of <= 0.1px (usually 1-2 iterations).
* **The multi-line algorithm** performs a binary search among the possible font sizes until converging with an error of <= 0.1px (usually ~10 iterations). There is no reliable way of predicting how the browser will render text in a different font size when multi-line text wrap is at play.
* **Performance** Each iteration has a performance hit. `AutoFit` uses `requestAnimationFrame` to throttle repeated calls, ensuring that we render as often as possible without excessively blocking the UI.
* **No overflow**. After usual iteration, the algorithms runs a second loop to ensure that no overflow occurs. Underflow is preferred since it doesn't look visually broken like overflow does.
* **Font size** is used rather than transform scale since the latter wouldn't support multi-line text wrap. Transform scale would work for singleline but we prefer to keep the two modes similar. Furthermore, transform scale tends to make text blurry in some browsers.

## Developing

When developing one typically wants to see the output in the example application without having to publish and install. We achieve this by linking the local package into the example app.

Because of [issues with `yarn link`](https://github.com/facebook/react/issues/14257), we use [Yalc](https://github.com/wclr/yalc). A linking approach is preferred over yarn workspaces since we want to run the package as it would appear in the real world.

```sh
npm i yalc -g
yarn
yarn watch

# Other terminal
cd example
yarn
yalc add --link auto-fit
yarn dev
```

### Notes on Yalc

Using `--link` makes it so that Next.js can HMR the updates instantly. It creates a `link:` rather than a `file:` dependency.

### Publishing

```sh
# Bump version number
yarn clean && yarn build
npm publish
```
