import React from "react";
import { Message } from "../lib";

const MessageExample = () => {
  const openMessage = () => {
    Message.info({ message: "open message.", duration: 3000 });
  };
  return (
    <div>
      <button onClick={openMessage}>打开 message.</button>
    </div>
  );
};

export default MessageExample;
