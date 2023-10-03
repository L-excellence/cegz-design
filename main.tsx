import React from "react";
import ReactDOM from "react-dom/client";

import ClickAwayListenerExample from "./example/ClickAwayListener";

// TODO... 增加一个 devDevelopment react-router-dom
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ClickAwayListenerExample />
  </React.StrictMode>
);
