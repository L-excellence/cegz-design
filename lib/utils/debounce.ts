export default function debounce(func: Function, wait = 166) {
  let timeout: number = 0;

  function debounced(...args: unknown[]) {
    const that = this;
    const later = () => {
      func.apply(that, args);
    };
    clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
  }

  debounced.clear = () => {
    clearTimeout(timeout);
  };

  return debounced;
}
