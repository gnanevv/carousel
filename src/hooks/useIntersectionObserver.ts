import { useEffect, useRef } from "react";

const useIntersectionObserver = (
  handler: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handler, options);
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handler, options]);

  return observerRef;
};

export default useIntersectionObserver;
