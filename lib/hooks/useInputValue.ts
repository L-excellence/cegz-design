/**
 * 处理 Input value change 操作，支持控制 中文拼音输入 合理触发业务 change 函数
 * （确认拼音对应的汉字后，再执行业务 change 逻辑（如：搜索、字符截取））
 *
 * 同时支持 value 使用对象结构（如一个多语种对象数据结构），需在 <input /> 上定义属性 data-key="xxx"
 *
 * 使用示例：
 *
 * const { value, setValue, onChange, onComposition } = useInputValue({
 *   defaultValue: "cegz",
 *   limit: 10,
 *   handler: () => console.log("处理业务逻辑."),
 * });
 *
 * <input
 *   type="text"
 *   value={value}
 *   onChange={onChange}
 *   onCompositionStart={onComposition}
 *   onCompositionEnd={onComposition}
 * />
 */

import React from "react";

type TInputElement = HTMLInputElement | HTMLTextAreaElement;

type InputChangeEvent = React.ChangeEvent<TInputElement>;
type InputCompositionEvent = React.CompositionEvent<TInputElement>;

export interface InputValueResult<T> {
  value: T;
  setValue: React.Dispatch<React.SetStateAction<T>>;
  onChange: (event: InputChangeEvent) => void;
  onComposition: (event: InputCompositionEvent) => void;
}

export interface InputValueOptions<T> {
  defaultValue: T;
  limit?: number;
  handler?: (value: T, event: InputChangeEvent | InputCompositionEvent) => void;
}

function useInputValue<T>(options: InputValueOptions<T>): InputValueResult<T> {
  const [value, setValue] = React.useState<T>(options.defaultValue);
  const compositionLockRef = React.useRef<boolean>(false);

  const handler = (event: InputChangeEvent | InputCompositionEvent) => {
    const input = event.target as HTMLInputElement;
    let value;
    if (options.limit && input.value.length > options.limit) {
      value = getNewValue(input, true);
      setValue(value); // 处理字符截取，在这一步要重新设置一次。
    } else {
      value = getNewValue(input);
    }
    options.handler && options.handler(value, event);
  };

  const getNewValue = (input: HTMLInputElement, limit: boolean = false) => {
    let newValue = input.value;
    // 截取 input value
    if (limit && options.limit) {
      newValue = newValue.substring(0, options.limit);
    }
    // 获取最新 value 值（value 可能为 string ｜ object）
    const key = input.getAttribute("data-key");
    if (Object.prototype.toString.call(value).slice(8, -1) === "Object") {
      if (key) {
        return { ...value, [key]: newValue };
      } else {
        console.error("value 作为对象使用，需先在 <input > 上指定属性 key.");
        return value;
      }
    } else {
      return newValue as T;
    }
  };

  const onChange = (event: InputChangeEvent) => {
    const input = event.target as HTMLInputElement;
    const newValue = getNewValue(input);
    setValue(newValue);
    if (compositionLockRef.current) return; // 允许输入中文时调用 setValue 更新视图 value，但不触发数据逻辑
    handler(event);
  };

  const onComposition = (event: InputCompositionEvent) => {
    if (event.type === "compositionend") {
      compositionLockRef.current = false;
      handler(event);
    } else {
      compositionLockRef.current = true;
    }
  };

  return {
    value,
    setValue,
    onChange,
    onComposition,
  };
}

export default useInputValue;
