import React, { useRef, useEffect } from "react";
import debounce from "../utils/debounce";
import Modal, { IModalProps } from "../Modal";

/**
 * 组件介绍：
 * 悬浮层，您可在另一个元素之上显示一些内容。基于 Modal 实现。
 */

type TPopoverBaseRect = Record<"width" | "height", number>;

export function getOffsetTop(
  rect: TPopoverBaseRect,
  vertical: number | string
) {
  let offset = 0;
  if (typeof vertical === "number") {
    offset = vertical;
  } else if (vertical === "center") {
    offset = rect.height / 2;
  } else if (vertical === "bottom") {
    offset = rect.height;
  }
  return offset;
}

export function getOffsetLeft(
  rect: TPopoverBaseRect,
  horizontal: number | string
) {
  let offset = 0;
  if (typeof horizontal === "number") {
    offset = horizontal;
  } else if (horizontal === "center") {
    offset = rect.width / 2;
  } else if (horizontal === "right") {
    offset = rect.width;
  }
  return offset;
}

const styles: Record<string, React.CSSProperties> = {
  paper: {
    position: "absolute",
    overflowY: "auto",
    overflowX: "hidden",
    minWidth: 16,
    minHeight: 16,
    maxWidth: "calc(100% - 32px)",
    maxHeight: "calc(100% - 32px)",
    outline: 0,
    backgroundColor: "#fff",
    borderRadius: "4px",
    boxShadow:
      "0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)",
  },
};

export interface IPopoverProps extends IModalProps {
  open: boolean;
  // 参照元素
  anchorEl: (() => HTMLElement) | HTMLElement | null;
  // 参照元素的 origin 水平与垂直 位置起点
  anchorOrigin: {
    vertical: "top" | "center" | "bottom";
    horizontal: "left" | "center" | "right";
  };
  // Popover 内容自身水平与垂直的位置起点
  transformOrigin: {
    vertical: "top" | "center" | "bottom";
    horizontal: "left" | "center" | "right";
  };
  children: React.ReactElement;
  // 设置与窗口边缘重叠的最小阀值
  marginThreshold?: number;
}

/**
 * 1. 创建出 modal，在 modal 之上渲染 children
 * 2. 根据 origin 确定 children 的位置
 */

const Popover = ({
  open,
  anchorEl,
  anchorOrigin,
  transformOrigin,
  children,
  marginThreshold = 16,
  ...other
}: IPopoverProps) => {
  const paperRef = useRef<HTMLDivElement>(null);

  // 设置 PositionStyle
  useEffect(() => {
    if (open) {
      setPositioningStyles();
    }
  }, [open]);

  // 监听窗口变化
  useEffect(() => {
    if (!open) return undefined;
    const handleResize = debounce(() => {
      setPositioningStyles();
    });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  // 设置 children 要展示的位置
  const setPositioningStyles = () => {
    const element = paperRef.current;
    if (!element) return;

    const positioning = getPositioningStyle(element);
    if (positioning.top !== null) {
      element.style.top = positioning.top;
    }
    if (positioning.left !== null) {
      element.style.left = positioning.left;
    }
    // CSS3 transformOrigin 可指定在特定的原点位置进行变换（translate（平移）、rotate（旋转）、skew(倾斜)、scale(缩放)）
    element.style.transformOrigin = positioning.transformOrigin;
  };

  // 根据配置获取 children 要展示的位置
  const getPositioningStyle = (element: HTMLElement) => {
    const elemRect = {
      width: element.offsetWidth,
      height: element.offsetHeight,
    };

    // 获取元素本身的变换原点（根据 element 和 props.transformOrigin）
    const elemTransformOrigin = getTransformOrigin(elemRect);
    // 获取 anchorEl 偏移量
    const anchorOffset = getAnchorOffset();

    // 计算元素定位
    let top = anchorOffset.top - elemTransformOrigin.vertical;
    let left = anchorOffset.left - elemTransformOrigin.horizontal;
    const bottom = top + elemRect.height;
    const right = left + elemRect.width;

    // 保证内容定位能够完全展示在窗口内
    const heightThreshold = window.innerHeight - marginThreshold;
    const widthThreshold = window.innerWidth - marginThreshold;

    if (top < marginThreshold) {
      const diff = top - marginThreshold;
      top -= diff;
      elemTransformOrigin.vertical += diff;
    } else if (bottom > heightThreshold) {
      const diff = bottom - heightThreshold;
      top -= diff;
      elemTransformOrigin.vertical += diff;
    }

    if (left < marginThreshold) {
      const diff = left - marginThreshold;
      left -= diff;
      elemTransformOrigin.horizontal += diff;
    } else if (right > widthThreshold) {
      const diff = right - widthThreshold;
      left -= diff;
      elemTransformOrigin.horizontal += diff;
    }

    return {
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      transformOrigin: [transformOrigin.horizontal, transformOrigin.vertical]
        .map((n) => `${n}px`)
        .join(" "),
    };
  };

  const getTransformOrigin = (elemRect: TPopoverBaseRect) => {
    return {
      vertical: getOffsetTop(elemRect, transformOrigin.vertical),
      horizontal: getOffsetLeft(elemRect, transformOrigin.horizontal),
    };
  };

  const getAnchorOffset = () => {
    const resolvedAnchorEl =
      typeof anchorEl === "function" ? anchorEl() : anchorEl;
    const anchorElement =
      resolvedAnchorEl && resolvedAnchorEl.nodeType === 1
        ? resolvedAnchorEl
        : document.body;
    const anchorRect = anchorElement.getBoundingClientRect();
    return {
      top: anchorRect.top + getOffsetTop(anchorRect, anchorOrigin.vertical),
      left:
        anchorRect.left + getOffsetLeft(anchorRect, anchorOrigin.horizontal),
    };
  };

  return (
    <Modal open={open} center={false} maskInvisible={true} {...other}>
      <div
        className="popover-paper"
        style={styles.paper}
        ref={paperRef}
        tabIndex={-1}
      >
        {React.cloneElement(children)}
      </div>
    </Modal>
  );
};

export default Popover;
