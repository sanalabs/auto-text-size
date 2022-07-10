import { AutoFit } from "auto-fit";
import { useState } from "react";

const containerStyle = {
  width: "50%",
  maxWidth: "400px",
  height: "100px",
  border: "1px dashed #555",
  outline: "none",
};

export default function Page() {
  const [text, setText] = useState("Demo text");
  const [minFontSizePx, setMinFontSizePx] = useState("8");
  const [maxFontSizePx, setMaxFontSizePx] = useState("160");

  const parsedMinFontSizePx = parseInt(minFontSizePx);
  const parsedMaxFontSizePx = parseInt(maxFontSizePx);

  const config = (
    <>
      <p>This is a demo of AutoFit. See the docs.</p>

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

      <hr />
    </>
  );

  let demoMultiline = (
    <>
      <p>
        Multiline (text fits both the width and the height of the container):
      </p>

      <div style={containerStyle}>
        <AutoFit
          multiline
          minFontSizePx={parsedMinFontSizePx}
          maxFontSizePx={parsedMaxFontSizePx}
        >
          {text}
        </AutoFit>
      </div>

      <hr />
    </>
  );

  let demoSingleLine = (
    <>
      <p>
        Single line (text fits the width of the container but grows freely in
        size, up to maxFontSizePx):
      </p>

      <div style={{ ...containerStyle, height: "unset" }}>
        <AutoFit
          minFontSizePx={parsedMinFontSizePx}
          maxFontSizePx={parsedMaxFontSizePx}
        >
          {text}
        </AutoFit>
      </div>

      <hr />
    </>
  );

  let demoAdvanced = (
    <>
      <p>
        Advanced (it works with any font variations and anything sized relative
        to font size):
      </p>

      <div style={{ ...containerStyle, height: 150 }}>
        <AutoFit
          multiline
          as="em"
          minFontSizePx={parsedMinFontSizePx}
          maxFontSizePx={parsedMaxFontSizePx}
        >
          {text}
          <span style={{ color: "#fba", fontSize: "1.5em" }}> 1.5em</span>
          <span style={{ color: "#fba", fontSize: "0.75em" }}> 0.75em</span>
          <strong style={{ color: "#fba", fontSize: "1.5rem" }}> 1.5rem</strong>
          <span
            style={{
              display: "inline-block",
              backgroundColor: "#fba",
              width: "1em",
              height: "1em",
              marginLeft: "0.5em",
            }}
          />
        </AutoFit>
      </div>
    </>
  );

  let warn = undefined;
  if (!isFinite(parsedMinFontSizePx)) warn = <>Invalid minFontSizePx</>;
  if (!isFinite(parsedMaxFontSizePx)) warn = <>Invalid maxFontSizePx</>;

  return (
    <div style={{ margin: "1rem" }}>
      {config}
      {warn || (
        <>
          {demoMultiline}
          {demoSingleLine}
          {demoAdvanced}
        </>
      )}
    </div>
  );
}
