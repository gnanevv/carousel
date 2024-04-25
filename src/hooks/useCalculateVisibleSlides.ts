import { useEffect, useCallback } from "react";

const useCalculateVisibleSlides = (
  images: string[],
  loadedIndexes: React.MutableRefObject<Set<number>>,
  imageCache: React.MutableRefObject<Map<string, HTMLImageElement>>
) => {
  const calculateVisibleSlides = useCallback(() => {
    let maxSlides = 5;
    let minSlides = 1;
    const windowWidth = window.innerWidth;

    if (windowWidth <= 480) {
      maxSlides = 1;
    } else if (windowWidth <= 768) {
      maxSlides = 2;
    } else if (windowWidth <= 1024) {
      maxSlides = 3;
    }

    const slidesToShow = Math.min(
      Math.max(Math.floor(windowWidth / (windowWidth / maxSlides)), minSlides),
      maxSlides
    );

    const startIndex = 0;
    const endIndex = Math.min(startIndex + slidesToShow - 1, images.length - 1);

    const visibleIndexes = [];
    for (let i = startIndex; i <= endIndex; i++) {
      const index = i % images.length;
      visibleIndexes.push(index);
      if (!loadedIndexes.current.has(index)) {
        loadedIndexes.current.add(index);
        const img = new Image();
        img.src = images[index];
        img.onload = () => {
          imageCache.current.set(images[index], img);
        };
      }
    }
  }, [images, loadedIndexes, imageCache]);

  useEffect(() => {
    calculateVisibleSlides();
    const handleResize = () => {
      calculateVisibleSlides();
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [calculateVisibleSlides]);
};

export default useCalculateVisibleSlides;
