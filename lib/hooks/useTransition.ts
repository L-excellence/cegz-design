import { useState, useRef, useEffect } from "react";

type TStageType = "enter" | "leave";
type TStageDurations = Record<TStageType, number>;

// 动画过渡 hook。跟踪组件 进入和退出 状态，从而由外部扩展动画
const useTransition = (
  open: boolean,
  durations: TStageDurations = { enter: 0, leave: 0 }
) => {
  // 基于外部 open state 来控制 Transition 时机
  const [show, setShow] = useState(open);
  // Transition status
  const [stage, setStage] = useState<TStageType | "">("");
  const timerRef = useRef<TStageDurations>({
    enter: undefined,
    leave: undefined,
  });

  useEffect(() => {
    if (open) {
      // 1. 先挂载 DOM，借助计时器延迟使用 进入 动画
      setShow(true);
      timerRef.current.enter = window.setTimeout(() => {
        setStage("enter");
      }, durations.enter);
    } else {
      // 2. 先执行 退出 动画，再执行销毁 DOM
      setStage("leave");
      timerRef.current.leave = window.setTimeout(() => {
        setShow(false);
      }, durations.leave);
    }
    return () => {
      window.clearTimeout(timerRef.current.enter);
      window.clearTimeout(timerRef.current.leave);
    };
  }, [open, durations]);

  return { show, stage };
};

export default useTransition;
