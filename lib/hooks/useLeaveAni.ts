import { useState, useRef, useEffect } from "react";

type TStageType = "enter" | "leave";
type TStageDurations = Record<TStageType, number>;

// 跟踪组件 进入和退出 状态，从而由外部扩展动画
const useLeaveAni = (
  shouldShow: boolean,
  durations: TStageDurations = { enter: 0, leave: 0 }
) => {
  const [show, setShow] = useState(shouldShow);
  const [stage, setStage] = useState<TStageType | "">("");
  const timerRef = useRef<TStageDurations>({
    enter: undefined,
    leave: undefined,
  });

  useEffect(() => {
    if (shouldShow) {
      setShow(true);
      timerRef.current.enter = window.setTimeout(() => {
        setStage("enter");
      }, durations.enter);
    } else {
      setStage("leave");
      timerRef.current.leave = window.setTimeout(() => {
        setShow(false);
      }, durations.leave);
    }
    return () => {
      window.clearTimeout(timerRef.current.enter);
      window.clearTimeout(timerRef.current.leave);
    };
  }, [shouldShow, durations]);

  return { show, stage };
};

export default useLeaveAni;
