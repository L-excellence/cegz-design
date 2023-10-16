import React from "react";
import ReactDOM from "react-dom/client";

import ClickAwayListenerExample from "./example/ClickAwayListener";
// import VirtualListExample from "./example/VirtualList";
// import PopoverExample from "./example/Popover";
// import Modal from "./example/Modal";
import Message from "./example/Message";

// TODO... 增加一个 devDevelopment react-router-dom
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* <ClickAwayListenerExample /> */}
    {/* <VirtualListExample /> */}
    {/* <PopoverExample /> */}
    {/* <Modal /> */}
    <Message />
  </React.StrictMode>
);
