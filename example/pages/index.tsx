import { AutoTextSize } from "auto-text-size";
import { useState } from "react";

const containerStyle = {
  width: "50%",
  maxWidth: "400px",
  border: "1px dashed #555",
  outline: "none",
  lineHeight: "1",
};

export default function Page() {
  const [text, setText] = useState("Lorem ipsum dolor sit amet");
  const [minFontSizePx, setMinFontSizePx] = useState("20");
  const [maxFontSizePx, setMaxFontSizePx] = useState("160");
  const [fontSizePrecisionPx, setFontSizePrecisionPx] = useState("0.1");

  const parsedMinFontSizePx = parseFloat(minFontSizePx);
  const parsedMaxFontSizePx = parseFloat(maxFontSizePx);
  const parsedFontSizePrecisionPx = parseFloat(fontSizePrecisionPx);

  const config = (
    <>
      <p>
        This is a demo of AutoTextSize. See the{" "}
        <a href="https://github.com/sanalabs/auto-text-size#readme">docs</a>.
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
        fontSizePrecisionPx:{" "}
        <input
          value={fontSizePrecisionPx}
          onChange={(e) => setFontSizePrecisionPx(e.target.value)}
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
        <strong>Oneline mode.</strong> Text fills the width of the container,
        without wrapping to multiple lines.
      </p>

      <div style={containerStyle}>
        <AutoTextSize
          mode="oneline"
          minFontSizePx={parsedMinFontSizePx}
          maxFontSizePx={parsedMaxFontSizePx}
          fontSizePrecisionPx={parsedFontSizePrecisionPx}
        >
          {text}
        </AutoTextSize>
      </div>

      <hr style={{ margin: "1rem 0" }} />

      <p>
        <strong>Multiline mode.</strong> Text fills the width of the container,
        wrapping to multiple lines if necessary.
      </p>

      <div style={containerStyle}>
        <AutoTextSize
          mode="multiline"
          minFontSizePx={parsedMinFontSizePx}
          maxFontSizePx={parsedMaxFontSizePx}
          fontSizePrecisionPx={parsedFontSizePrecisionPx}
        >
          {text}
        </AutoTextSize>
      </div>

      <hr style={{ margin: "1rem 0" }} />

      <p>
        <strong>Box mode.</strong> Text fills both the width and the height of
        the container, allowing wrapping to multiple lines.
      </p>

      <div style={{ ...containerStyle, height: "100px" }}>
        <AutoTextSize
          mode="box"
          minFontSizePx={parsedMinFontSizePx}
          maxFontSizePx={parsedMaxFontSizePx}
          fontSizePrecisionPx={parsedFontSizePrecisionPx}
          onUpdate={() => console.log('On update')}
        >
          {text}
        </AutoTextSize>
      </div>
    </>
  );

  let warn = undefined;
  if (!isFinite(parsedMinFontSizePx)) warn = <>Invalid minFontSizePx</>;
  if (!isFinite(parsedMaxFontSizePx)) warn = <>Invalid maxFontSizePx</>;
  if (!isFinite(parsedFontSizePrecisionPx) || parsedFontSizePrecisionPx === 0)
    warn = <>Invalid fontSizePrecisionPx</>;

  return (
    <div style={{ margin: "1rem" }}>
      {config}
      {warn || demo}
    </div>
  );
}
