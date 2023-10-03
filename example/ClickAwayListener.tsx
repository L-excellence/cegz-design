import React, { useState } from "react";
import ReactDOM from "react-dom";
import { ClickAwayListener } from "../lib";

const ClickAwayListenerExample = () => {
  const [open, setOpen] = useState(false);

  const handleClickAway = () => {
    console.log("click away.");
    setOpen(false);
  };

  return (
    <div>
      <h2>ClickAwayListenerExample: </h2>

      {/* <ClickAwayListener onClickAway={handleClickAway}>
        <div style={{ position: "relative", width: 300, margin: "100px auto" }}>
          <button type="button" onClick={() => setOpen(true)}>
            Open menu dropdown
          </button>
          {open ? (
            <div style={{ position: "absolute", top: 28 }}>
              Click me, I will stay visible until you click outside.
            </div>
          ) : null}
        </div>
      </ClickAwayListener> */}

      <ClickAwayListener onClickAway={handleClickAway}>
        <div
          style={{ position: "relative", width: 300, margin: "100px auto" }}
          onClick={() => console.log("会触发吗？")}
        >
          <button type="button" onClick={() => setOpen(true)}>
            Open menu dropdown
          </button>
          {open
            ? ReactDOM.createPortal(
                <div
                  style={{ position: "absolute", top: 28, background: "gray" }}
                >
                  Click me, I will stay visible until you click outside.
                </div>,
                document.body
              )
            : null}
        </div>
      </ClickAwayListener>
    </div>
  );
};

export default ClickAwayListenerExample;
