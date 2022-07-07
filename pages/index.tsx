import type { NextPage } from "next";
import { useState } from "react";
import { AutoFitText } from "../AutoFitText";

const containerStyle = {
  width: "50%",
  height: "100px",
  border: "1px solid",
};

const Home: NextPage = () => {
  const [text, setText] = useState("Demo text Demo text");
  const [minFontSizePx, setMinFontSizePx] = useState("10");
  const [maxFontSizePx, setMaxFontSizePx] = useState("200");

  const parsedMinFontSizePx = parseInt(minFontSizePx);
  const parsedMaxFontSizePx = parseInt(maxFontSizePx);

  const config = (
    <>
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
      <p>Multiline:</p>

      <AutoFitText
        multiline
        ellipsis
        minFontSizePx={parsedMinFontSizePx}
        maxFontSizePx={parsedMaxFontSizePx}
        style={containerStyle}
      >
        {text}
      </AutoFitText>

      <hr />
    </>
  );

  let demoSingleLine = (
    <>
      <p>Single line:</p>

      <AutoFitText
        ellipsis
        minFontSizePx={parsedMinFontSizePx}
        maxFontSizePx={parsedMaxFontSizePx}
        style={{ ...containerStyle, height: "unset" }}
      >
        {text}
      </AutoFitText>

      <hr />
    </>
  );

  let demoAdvanced = (
    <>
      <p>Advanced:</p>

      <AutoFitText
        multiline
        ellipsis
        minFontSizePx={parsedMinFontSizePx}
        maxFontSizePx={parsedMaxFontSizePx}
        style={containerStyle}
      >
        {text}
        <span style={{ color: "red", fontSize: "1rem" }}> Fixed</span>
        <span style={{ color: "red", fontSize: "0.5em" }}> Half</span>
        <span style={{ color: "red", fontSize: "2em" }}> Double</span>
      </AutoFitText>
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
};

export default Home;
