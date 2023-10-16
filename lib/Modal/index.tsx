import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { useForkRef } from "../hooks";
import classNames from "../utils/classNames";
import { useTransition } from "../hooks";

const styles: Record<string, React.CSSProperties> = {
  root: {
    position: "fixed",
    zIndex: 1200,
    right: 0,
    bottom: 0,
    top: 0,
    left: 0,
  },
  mask: {
    zIndex: -1,
    position: "fixed",
    right: 0,
    bottom: 0,
    top: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    opacity: 0,
    transition: "opacity .3s",
    WebkitTapHighlightColor: "transparent",
  },
  invisible: {
    backgroundColor: "transparent",
  },
  content: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: `translate(-50%, -50%)`,
    backgroundColor: "#fff",
    padding: "12px",
    borderRadius: "2px",
  },
};

export interface IModalProps {
  open: boolean;
  onClose: (event: unknown, reason: "escapeKeyDown" | "maskClick") => void;
  children: React.ReactElement;
  container?: HTMLElement;
  disableEscapeKeyDown?: boolean;
  maskInvisible?: boolean;
  center?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const Modal = ({
  open,
  onClose,
  container = document.body,
  className,
  style,
  children,
  center = true,
  maskInvisible = false,
  disableEscapeKeyDown = false,
}: IModalProps) => {
  const { show, stage } = useTransition(open, { enter: 0, leave: 300 });
  const contentRef = React.useRef<HTMLElement>(null);
  const handleRef = useForkRef((children as any).ref, contentRef);

  // 聚焦元素
  useEffect(() => {
    if (!show) return undefined;
    // 让 children 元素 focus()，以便触发元素 onKeydown 键盘事件.
    contentRef.current!.focus();
  }, [show]);

  // 要想使键盘事件在绑定 DOM 中生效，有一个前提条件是 当前 focus 元素（document.activeElement）在该元素的 DOM Tree 内
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "Escape") return;
    if (!disableEscapeKeyDown) {
      event.stopPropagation();
      onClose(event, "escapeKeyDown");
    }
  };

  const childProps: { ref: React.Ref<HTMLElement>; tabIndex?: number } = {
    ref: handleRef,
  };
  // tabIndex = -1 目的是排除在 tab 键焦点队列之外，但元素的 focus() 仍可正常使用。
  if (children.props.tabIndex === undefined) {
    childProps.tabIndex = children.props.tabIndex || "-1";
  }

  return show
    ? ReactDOM.createPortal(
        <div
          className={classNames("cegz-modal", { className })}
          style={{ ...styles.root, ...style }}
          onKeyDown={handleKeyDown}
        >
          <div
            // className={"cegz-modal-mask " + stage}
            className="cegz-modal-mask"
            onClick={() => onClose(null, "maskClick")}
            style={{
              ...styles.mask,
              ...(maskInvisible ? styles.invisible : {}),
              opacity: stage === "enter" ? 1 : 0,
            }}
          ></div>
          {center ? (
            <div className="cegz-modal-content" style={styles.content}>
              {React.cloneElement(children, childProps)}
            </div>
          ) : (
            React.cloneElement(children, childProps)
          )}
        </div>,
        container
      )
    : null;
};

export default Modal;
