import React, { useRef, useState, useEffect, useReducer } from "react";

export enum DIRECTION {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical",
}

export interface ItemStyle {
  position: "absolute";
  top?: number;
  left: number;
  width: string | number;
  height?: number;
  marginTop?: number;
  marginLeft?: number;
  marginRight?: number;
  marginBottom?: number;
  zIndex?: number;
}

export interface IVirtualListProps {
  width: number | string; // list宽度
  height: number | string; // list高度
  itemCount: number; // item 个数
  itemSize: number; // item 固定的高度/宽度（取决于滚动方向）
  renderItem(itemInfo: { index: number; style: ItemStyle }): React.ReactNode; // item 渲染节点
  scrollDirection?: DIRECTION; // 列表应该垂直还是水平滚动。“垂直”（默认）或“水平”之一
  overscanCount?: number; // 上方/下方渲染的额外缓冲区项数
  scrollOffset?: number; // 可用于设置初始化滚动偏移量
  onScroll?(offset: number, event: Event): void;
  className?: string;
  style?: React.CSSProperties;
}

const sizeProp = {
  [DIRECTION.VERTICAL]: "height",
  [DIRECTION.HORIZONTAL]: "width",
};

const positionProp = {
  [DIRECTION.VERTICAL]: "top",
  [DIRECTION.HORIZONTAL]: "left",
};

const STYLE_WRAPPER: React.CSSProperties = {
  overflow: "auto",
  willChange: "transform",
  WebkitOverflowScrolling: "touch",
};

const STYLE_INNER: React.CSSProperties = {
  position: "relative",
  minWidth: "100%",
  minHeight: "100%",
};

const VirtualList = (props: IVirtualListProps) => {
  const {
    width,
    height,
    itemCount,
    itemSize,
    renderItem,
    style = {},
    onScroll,
    scrollOffset,
    overscanCount = 3,
    scrollDirection = DIRECTION.VERTICAL,
    ...otherProps
  } = props;
  const rootNode = useRef<HTMLDivElement | null>(null);
  const [, forceUpdate] = useReducer((v) => v + 1, 0);
  const [offset, setOffset] = useState<number>(scrollOffset || 0); // 滚动位置
  const [styleCache] = useState<{ [id: number]: ItemStyle }>({}); // 存储每个 item 的 style（也可用 useRef）

  // 初始化，默认参数及事件绑定
  useEffect(() => {
    forceUpdate(); // 强制更新一次，供 getVisibleRange 方法获取 DOM 挂载后 containerSize
    if (scrollOffset) scrollTo(scrollOffset);

    rootNode.current?.addEventListener("scroll", handleScroll);
    return () => {
      rootNode.current?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScroll = (event: Event) => {
    const { scrollTop = 0, scrollLeft = 0 } =
      rootNode.current as HTMLDivElement;
    const newOffset =
      scrollDirection === DIRECTION.VERTICAL ? scrollTop : scrollLeft;
    if (
      newOffset < 0 ||
      newOffset === offset ||
      event.target !== rootNode.current
    ) {
      return;
    }
    setOffset(newOffset); // 记录滚动位置，根据这个位置重新计算要渲染的数据
    if (typeof onScroll === "function") {
      onScroll(offset, event);
    }
  };

  const scrollTo = (value: number) => {
    if (scrollDirection === DIRECTION.VERTICAL) {
      rootNode.current!.scrollTop = value;
    } else {
      rootNode.current!.scrollLeft = value;
    }
  };

  const getStyle = (index: number) => {
    const style = styleCache[index];
    if (style) return style;

    return (styleCache[index] = {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      [sizeProp[scrollDirection]]: props.itemSize, // height / width
      [positionProp[scrollDirection]]: props.itemSize * index, // top / left
    });
  };

  // 核心，根据滚动位置 offset 来获取列表中要渲染的数据 起始和结尾 的坐标
  const getVisibleRange = () => {
    // 获取可视范围
    const { clientHeight = 0, clientWidth = 0 } =
      (rootNode.current as HTMLDivElement) || {};
    const containerSize: number =
      scrollDirection === DIRECTION.VERTICAL ? clientHeight : clientWidth;
    let start = Math.floor(offset / itemSize - 1); // start --> 向下取整 （索引是从0开始，所以 - 1）
    let stop = Math.ceil((offset + containerSize) / itemSize - 1); // stop --> 向上取整
    return {
      start: Math.max(0, start - overscanCount),
      stop: Math.min(stop + overscanCount, itemCount - 1),
    };
  };

  const wrapperStyle = { ...STYLE_WRAPPER, ...style, height, width };
  const innerStyle = {
    ...STYLE_INNER,
    [sizeProp[scrollDirection]]: itemCount * itemSize, // 计算列表整体高度/宽度（取决于垂直或水平），实现撑开内容滚动
  };
  const items: React.ReactNode[] = [];
  const { start, stop } = getVisibleRange();
  for (let index = start; index <= stop; index++) {
    items.push(renderItem({ index, style: getStyle(index) }));
  }

  return (
    <div ref={rootNode} {...otherProps} style={wrapperStyle}>
      <div style={innerStyle}>{items}</div>
    </div>
  );
};

export default VirtualList;
