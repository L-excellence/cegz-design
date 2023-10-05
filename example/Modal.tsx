import React, { useState } from "react";
import { Modal } from "../lib";

const ModalExample = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setOpen(true)}>打开 Modal</button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div>Modal content.</div>
      </Modal>
    </div>
  );
};

export default ModalExample;
