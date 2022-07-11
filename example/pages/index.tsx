import { AutoTextSize } from "auto-text-size";
import { useState } from "react";

const containerStyle = {
  width: "50%",
  maxWidth: "400px",
  height: "100px",
  border: "1px dashed #555",
  outline: "none",
  lineHeight: "1",
};

export default function Page() {
  const [text, setText] = useState("Lorem ipsum dolor sit amet");
  const [minFontSizePx, setMinFontSizePx] = useState("8");
  const [maxFontSizePx, setMaxFontSizePx] = useState("160");

  const parsedMinFontSizePx = parseInt(minFontSizePx);
  const parsedMaxFontSizePx = parseInt(maxFontSizePx);

  const config = (
    <>
      <p>
        This is a demo of AutoTextSize. See the{" "}
        <a href="https://github.com/sanalabs/auto-text-size">docs</a>.
      </p>

      <h3>Config</h3>
      <p>
        minFontSizePx:{" "}
        <input
          value={minFontSizePx}
          onChange={(e) => setMinFontSizePx(e.target.value)}
        />
      </p>
      <p>
        maxFontSizePx:{" "}
        <input
          value={maxFontSizePx}
          onChange={(e) => setMaxFontSizePx(e.target.value)}
        />
      </p>
      <p>
        Text:{" "}
        <textarea value={text} onChange={(e) => setText(e.target.value)} />
      </p>

      <hr style={{ margin: "1rem 0" }} />
    </>
  );

  let demo = (
    <>
      <p>
        <strong>Single-line.</strong> Text fills the width of the container,
        without wrapping to more than one line.
      </p>

      <div style={{ ...containerStyle, height: "unset" }}>
        <AutoTextSize
          minFontSizePx={parsedMinFontSizePx}
          maxFontSizePx={parsedMaxFontSizePx}
        >
          {text}
        </AutoTextSize>
      </div>

      <hr style={{ margin: "1rem 0" }} />

      <p>
        <strong>Multi-line.</strong> Text fills both the width and the height of
        the container, allowing wrapping to multiple lines.
      </p>

      <div style={containerStyle}>
        <AutoTextSize
          multiline
          minFontSizePx={parsedMinFontSizePx}
          maxFontSizePx={parsedMaxFontSizePx}
        >
          {text}
        </AutoTextSize>
      </div>
    </>
  );

  let warn = undefined;
  if (!isFinite(parsedMinFontSizePx)) warn = <>Invalid minFontSizePx</>;
  if (!isFinite(parsedMaxFontSizePx)) warn = <>Invalid maxFontSizePx</>;

  return (
    <div style={{ margin: "1rem" }}>
      {config}
      {warn || demo}
    </div>
  );
}
