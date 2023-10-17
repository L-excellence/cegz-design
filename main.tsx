import React from "react";
import ReactDOM from "react-dom/client";

// import ClickAwayListenerExample from "./example/ClickAwayListener";
// import VirtualListExample from "./example/VirtualList";
// import PopoverExample from "./example/Popover";
// import Modal from "./example/Modal";
// import Message from "./example/Message";
import Tabs from "./example/Tabs";

// TODO... 增加一个 devDevelopment react-router-dom
// ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
//   // 在严格模式下，React 18 的开发环境会刻意执行两次渲染，用于突出显示潜在问题。如果不想出现这个问题，可以将入口文件中的严格模式去除：
//   <React.StrictMode>
//     {/* <ClickAwayListenerExample /> */}
//     {/* <VirtualListExample /> */}
//     {/* <PopoverExample /> */}
//     {/* <Modal /> */}
//     {/* <Message /> */}
//     <Tabs />
//   </React.StrictMode>
// );


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.Fragment>
    {/* <ClickAwayListenerExample /> */}
    {/* <VirtualListExample /> */}
    {/* <PopoverExample /> */}
    {/* <Modal /> */}
    {/* <Message /> */}
    <Tabs />
  </React.Fragment>
);