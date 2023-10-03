import React from "react";
import { useForkRef } from "../hooks";

/**
 * 组件介绍：
 * 它处点击监听器，用于检测点击事件是否发生在元素之外。
 */

export interface ClickAwayListenerProps {
  onClickAway: Function;
  children: React.ReactElement;
}

const ClickAwayListener = ({
  onClickAway,
  children,
}: ClickAwayListenerProps) => {
  const nodeRef = React.useRef<HTMLElement>(null);
  // 允许同时存在两个 ref
  const handleRef = useForkRef(
    // @ts-expect-error TODO upstream fix
    children.ref,
    nodeRef
  );
  // flag，记录 children 点击事件动作（兼容 children 中存在使用 ReactDOM.Protal 将内容挂载到 children 之外的地方）
  const syntheticEventRef = React.useRef(false);
  const mouseEvent = "onClick";

  // 绑定点击事件（借助事件冒泡）
  React.useEffect(() => {
    const eventName = mouseEvent.substring(2).toLowerCase();
    document.addEventListener(eventName, handleClickAway);
    return () => {
      document.removeEventListener(eventName, handleClickAway);
    };
  }, [onClickAway]);

  const handleClickAway = (event: MouseEvent) => {
    // 是否在 children 内的元素触发了点击事件，用于处理 Protal 场景
    const insideReactTree = syntheticEventRef.current;
    syntheticEventRef.current = false;

    // child 未渲染出来 || 点击了滚动条
    if (!nodeRef.current || clickedRootScrollbar(event)) {
      return;
    }
    const insideDOM = nodeRef.current.contains(event.target as HTMLElement);
    // 点击了元素之外的地方，触发回调
    if (!insideDOM && !insideReactTree) {
      onClickAway(event);
    }
  };

  // 是否点击了滚动条
  function clickedRootScrollbar(event: MouseEvent) {
    return (
      document.documentElement.clientWidth < event.clientX ||
      document.documentElement.clientHeight < event.clientY
    );
  }

  const childrenProps = {
    ref: handleRef,
    // 场景：children 中的元素通过 ReactDOM.Protal 挂载到了其他元素中，此时 children 将不能通过 contains 去判断 DOM Tree 包含，
    // 尽管 DOM Tree 上 children 与 Protal 的子元素没有直接关系，但在触发事件冒泡机制上，它们之间依旧存在 DOM Tree 关系。
    [mouseEvent]: (event: React.MouseEvent) => {
      syntheticEventRef.current = true; // 记录 Flag.
      const childrenPropsHandler = children.props[mouseEvent];
      if (childrenPropsHandler) {
        childrenPropsHandler(event);
      }
    },
  };
  return React.cloneElement(children, childrenProps);
};

export default ClickAwayListener;
