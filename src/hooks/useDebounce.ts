import { useEffect, useRef } from "react";

const useDebounce = <T extends any[]>(
  callback: (...args: T) => void,
  delay: number
) => {
  const timeoutRef = useRef<number | null>(null);

  const debounceCallback = (...args: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      callback(...args);
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debounceCallback;
};

export default useDebounce;
