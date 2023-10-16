import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";

export interface IMessageProps {
  message: string; // 消息文案
  type?: "success" | "info" | "warning" | "error"; // 主题
  duration?: number; // 显示时间, 毫秒。设为 0 则不会自动关闭
  center?: boolean; // 是否居中
  verticalOffset?: number; // 垂直偏移量
  onClose?(): void; // 关闭时的回调函数
  className?: string;
  style?: React.CSSProperties;
}

const MessageComponent = ({
  message,
  type = "info",
  duration = 3000,
  center = false,
  verticalOffset = 20,
  onClose,
  className,
  style = {},
}: IMessageProps) => {
  const timer = useRef<number>(0);

  useEffect(() => {
    startTimer();
    document.addEventListener("keydown", onKeydown);
    return () => {
      document.removeEventListener("keydown", onKeydown);
    };
  });

  const onKeydown = (e: KeyboardEvent) => {
    if (e.keyCode === 27) onClose && onClose();
  };

  const startTimer = () => {
    if (duration > 0) {
      timer.current = window.setTimeout(() => {
        onClose && onClose();
      }, duration);
    }
  };

  const clearTimer = () => {
    clearTimeout(timer.current);
  };

  const classNames = `
    cegz-message
    cegz-message--${type}
    ${center ? "cegz-message-center" : ""}
    ${className ? className : ""}
  `
    .trim()
    .replace(/\s+/g, " ");

  const wrapperStyle = { top: verticalOffset, ...style };

  return (
    <div
      role="message"
      className={classNames}
      style={wrapperStyle}
      onMouseLeave={() => startTimer()}
      onMouseEnter={clearTimer}
    >
      <i className={`cegz-message__icon cegz-message__icon-${type}`.trim()}>
        {"Icon"}
      </i>
      <p className={`cegz-message__content cegz-message__content-${type}`}>
        {message}
      </p>
    </div>
  );
};

export interface IMessageOptions extends IMessageProps {
  offset?: number; // 顶部第一个 Message 显示位置
}

export interface IMessageInstance {
  id: string;
  $el: HTMLDivElement;
  close(): void;
}

let instance: IMessageInstance;
let instances: Array<IMessageInstance> = [];
let seed: number = 1;

const Message = function (options: IMessageOptions | string) {
  if (typeof options === "string") {
    options = {
      message: options,
    };
  }
  let id = "message_" + seed++;

  let userOnClose = options.onClose;
  options.onClose = function () {
    Message.close(id, userOnClose);
  };

  let verticalOffset = options.offset || 20,
    lastVerticalOffset = 0;
  instances.forEach((item, index) => {
    const messageDom = item.$el.firstChild as HTMLDivElement;
    index === instances.length - 1 && (lastVerticalOffset = verticalOffset);
    verticalOffset += messageDom.offsetHeight + 16;
  });

  let el = document.createElement("div");
  document.body.appendChild(el);
  ReactDOM.createRoot(el).render(
    React.createElement(MessageComponent, {
      ...options,
      verticalOffset: lastVerticalOffset,
    })
  );

  // animation
  setTimeout(() => {
    (el.firstChild as HTMLDivElement).style.top = verticalOffset + "px";
  });

  instance = {
    id,
    $el: el,
    close: options.onClose,
  };
  instances.push(instance);
  return instance;
};

Message.close = function (id: string, userOnClose?: () => void) {
  let len = instances.length;
  let index = -1;
  let removedHeight = 0;
  // 移除 message
  for (let i = 0; i < len; i++) {
    const { id: instanceId, $el } = instances[i];
    if (id === instanceId) {
      removedHeight = ($el.firstChild as HTMLDivElement).offsetHeight;
      index = i;
      if (typeof userOnClose === "function") {
        userOnClose();
      }
      instances.splice(i, 1);
      $el.parentNode!.removeChild($el);
      break;
    }
  }

  // 调整其他 message 位置
  if (len <= 1 || index === -1 || index > instances.length - 1) return;
  for (let i = index; i < len - 1; i++) {
    let messageDom = instances[i].$el.firstChild as HTMLDivElement;
    messageDom.style["top"] =
      parseInt(messageDom.style["top"], 10) - removedHeight - 16 + "px";
  }
};

Message.closeAll = function () {
  for (let i = instances.length - 1; i >= 0; i--) {
    instances[i].close();
  }
};

// 对外提供消息类型方法
["success", "warning", "info", "error"].forEach((type) => {
  // @ts-ignore
  Message[type] = (options: IMessageOptions) => {
    if (typeof options === "string") {
      options = {
        message: options,
      };
    }
    options.type = type as IMessageProps["type"];
    return Message(options);
  };
});

export interface MessageApi {
  (options: IMessageOptions | string): IMessageInstance;
  close(id: string, userOnClose?: () => void): void;
  closeAll(): void;
  success(options: IMessageOptions | string): IMessageInstance;
  warning(options: IMessageOptions | string): IMessageInstance;
  info(options: IMessageOptions | string): IMessageInstance;
  error(options: IMessageOptions | string): IMessageInstance;
}

export { MessageComponent };
export default Message as MessageApi;
