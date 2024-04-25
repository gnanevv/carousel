import { useEffect } from "react";

const usePreloadImages = (
  currentIndex: number,
  images: string[],
  loadedIndexes: React.MutableRefObject<Set<number>>,
  imageCache: React.MutableRefObject<Map<string, HTMLImageElement>>
) => {
  useEffect(() => {
    const preloadImages = () => {
      const startIndex =
        currentIndex === 0 ? images.length - 1 : currentIndex - 1;
      const endIndex = (currentIndex + 1) % images.length;
      const indexesToPreload = [
        (startIndex + 1) % images.length,
        (endIndex - 1 + images.length) % images.length,
      ];

      indexesToPreload.forEach((index) => {
        if (!loadedIndexes.current.has(index)) {
          const img = new Image();
          img.src = images[index];
          img.onload = () => {
            loadedIndexes.current.add(index);
            imageCache.current.set(images[index], img);
          };
        }
      });
    };

    preloadImages();
  }, [currentIndex, images, loadedIndexes, imageCache]);
};

export default usePreloadImages;
