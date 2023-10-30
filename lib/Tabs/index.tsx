import React, { useState, useRef, useEffect } from "react";
import "./index.scss";
import classNames from "../utils/classNames";
import { useRefs } from "../hooks";

export interface ITabsItem {
  key: string;
  label: string;
  children: React.ReactNode;
}

export interface ITabsProps {
  defaultActiveKey: string;
  items: ITabsItem[];
  onChange: (key: string) => void;
}

const Tabs = ({ defaultActiveKey, items, onChange }: ITabsProps) => {
  const [activeKey, setActiveKey] = useState<string>(
    defaultActiveKey || items[0]?.key
  );
  const [inkStyle, setInkStyle] = useState<React.CSSProperties>({
    width: 36,
    left: undefined,
  });
  const [mountInkBar, setMountInkBar] = useState<boolean>(false); // 渲染 Tabs Nav 墨水条
  // 性能优化，记录是否被选中过，初次进入页面，仅渲染 activeKey TabPane
  const activeRecord = useRef<Record<string, boolean>>(
    items.reduce((pre, cur) => {
      (pre as Record<string, boolean>)[cur.key] = activeKey === cur.key;
      return pre;
    }, {})
  );
  const [bindTabRef, getTabRef] = useRefs<HTMLDivElement>();

  useEffect(() => {
    const handleInkBarPosition = () => {
      // 不需要 setTimeout，在 useEffect 中直接可以拿到 DOM
      const activeTabEle = getTabRef(activeKey).current;
      const left = activeTabEle.offsetLeft + activeTabEle.offsetWidth / 2;
      setInkStyle({ ...inkStyle, left });
      setMountInkBar(true);
    };
    handleInkBarPosition();
    window.addEventListener("resize", handleInkBarPosition);
    return () => {
      window.removeEventListener("resize", handleInkBarPosition);
    };
  }, [activeKey]);

  const handleChange = (item: ITabsItem) => {
    activeRecord.current[item.key] = true;
    setActiveKey(item.key);
    onChange(item.key);
  };

  return (
    <div className="cegz-tabs">
      <div className="cegz-tabs-nav">
        <div className="cegz-tabs-nav-list">
          {items.map((item) => (
            <div
              key={item.key}
              ref={bindTabRef(item.key)}
              onClick={() => handleChange(item)}
              className={classNames("cegz-tabs-tab", {
                "cegz-tabs-tab-active": activeKey === item.key,
              })}
            >
              {item.label}
            </div>
          ))}
          {mountInkBar ? (
            <div
              className="cegz-tabs-ink-bar cegz-tabs-ink-bar-animated"
              style={inkStyle}
            ></div>
          ) : null}
        </div>
      </div>
      <div className="cegz-tabs-content">
        {items.map((item) =>
          activeRecord.current[item.key] ? (
            <div
              key={item.key}
              className={classNames(
                "cegz-tabs-tabpane",
                `cegz-tabs-tabpane-${
                  activeKey === item.key ? "active" : "hidden"
                }`
              )}
            >
              {item.children}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};

export default Tabs;
