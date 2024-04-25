import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  TouchEvent,
  useMemo,
} from "react";
import { Loader } from "../Loader";
import { Slide } from "./Slide";
import {
  useCalculateVisibleSlides,
  useDebounce,
  useIntersectionObserver,
  usePreloadImages,
} from "../../hooks";

const DEFAULT_WIDTH = 0;

export interface CarouselProps {
  images: string[]; // Accepts an array of image URLs
}

const Carousel: React.FC<CarouselProps> = ({ images }) => {
  const [containerWidth, setContainerWidth] = useState(DEFAULT_WIDTH);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedIndexes = useRef<Set<number>>(new Set());
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const touchStartX = useRef<number | null>(null);
  usePreloadImages(currentIndex, images, loadedIndexes, imageCache); // Preload images on first render and when index changes

  useCalculateVisibleSlides(images, loadedIndexes, imageCache); // Calculate which images to show on screen

  // Set container width on initial render and on window resize
  useEffect(() => {
    const updateContainerWidth = () => {
      const newContainerWidth = window.innerWidth;
      setContainerWidth(newContainerWidth || DEFAULT_WIDTH);
    };

    updateContainerWidth(); // Call on initial render

    window.addEventListener("resize", updateContainerWidth);

    return () => {
      window.removeEventListener("resize", updateContainerWidth);
    };
  }, []);

  // Go to next or previous slide
  const goToSlide = useCallback(
    (direction: "next" | "prev") => {
      if (!isTransitioning) {
        setIsTransitioning(true);

        const container = containerRef.current;
        if (!container) return;

        const newIndex =
          direction === "next"
            ? currentIndex === images.length - 1
              ? 0
              : currentIndex + 1
            : currentIndex === 0
            ? images.length - 1
            : currentIndex - 1;

        setCurrentIndex(newIndex);

        const offset = container.clientWidth * newIndex;

        container.style.transition = "transform 0.1s ease-in-out";
        container.style.transform =
          direction === "next"
            ? `translateX(-${offset}px)`
            : `translateX(${offset}px)`;

        const transitionEndHandler = () => {
          container.style.transition = "";
          container.style.transform = "";
          setIsTransitioning(false);
          container.removeEventListener("transitionend", transitionEndHandler);
        };

        container.addEventListener("transitionend", transitionEndHandler);
      }
    },
    [currentIndex, images, isTransitioning]
  );

  // Handle swipe gestures
  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (touchStartX.current !== null) {
        const touchEndX = event.touches[0].clientX;
        const delta = touchStartX.current - touchEndX;
        if (delta > 50) {
          goToSlide("next");
        } else if (delta < -50) {
          goToSlide("prev");
        }
        touchStartX.current = touchEndX;
      }
    },
    [goToSlide]
  );

  // Handle mouse wheel events
  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (!isTransitioning) {
        const delta = event.deltaY;
        const direction = delta > 0 ? "next" : "prev";
        goToSlide(direction);
      }
    },
    [isTransitioning, goToSlide]
  );

  // Reset touchStartX on touch start
  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      touchStartX.current = event.touches[0].clientX;
    },
    []
  );

  // Load images when they are visible in the viewport using Intersection Observer
  const intersectionHandler = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(
            entry.target.getAttribute("data-index") || "0",
            10
          );
          if (!loadedIndexes.current.has(index)) {
            loadedIndexes.current.add(index);
            const img = new Image();
            img.src = images[index];
            imageCache.current.set(images[index], img);
          }
        }
      });
    },
    [images, loadedIndexes, imageCache]
  );

  const observerRef = useIntersectionObserver(intersectionHandler, {
    root: containerRef.current,
    threshold: 0.5,
  });

  // Attach observer to all slides on render and clean up on unmount
  useEffect(() => {
    const observer = observerRef.current;
    if (observer) {
      document.querySelectorAll(".slide").forEach((slide) => {
        observer.observe(slide);
      });
    }
    return () => {
      if (observer) {
        document.querySelectorAll(".slide").forEach((slide) => {
          observer.unobserve(slide);
        });
      }
    };
  }, [observerRef]);

  // Debounce image preloading to only happen when the currentIndex changes
  const debounceDelay = 300;
  const debouncedPreloadImages = useDebounce(() => {
    const startIndex =
      currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    const endIndex = (currentIndex + 1) % images.length;
    const indexesToPreload = [];
    indexesToPreload.push((startIndex + 1) % images.length);
    indexesToPreload.push((endIndex - 1 + images.length) % images.length);
    indexesToPreload.forEach((index) => {
      if (!loadedIndexes.current.has(index)) {
        loadedIndexes.current.add(index);
        const img = new Image();
        img.src = images[index];
        imageCache.current.set(images[index], img);
      }
    });
  }, debounceDelay);

  useEffect(() => {
    debouncedPreloadImages();
  }, [currentIndex, debouncedPreloadImages]);

  const renderSlides = useMemo(() => {
    if (
      !images ||
      images.length === 0 ||
      !containerWidth ||
      isNaN(containerWidth)
    ) {
      return <Loader />;
    }

    // Calculate how many slides to show based on viewport width (can be extracted into const)
    const breakpoints = [480, 768, 1024];
    const maxSlides = [1, 2, 3, 5];

    let maxSlidesToShow = 5;
    for (let i = 0; i < breakpoints.length; i++) {
      if (containerWidth <= breakpoints[i]) {
        maxSlidesToShow = maxSlides[i];
        break;
      }
    }

    // Calculate which slides to show on screen based on currentIndex
    const startIndex =
      (currentIndex - Math.floor(maxSlidesToShow / 2) + images.length) %
      images.length;

    const visibleIndexes = Array.from(
      { length: maxSlidesToShow },
      (_, i) => (startIndex + i) % images.length
    );

    return visibleIndexes.map((index) => (
      <Slide
        key={`slide_${index}`}
        index={index}
        image={images[index]}
        onTouchStart={handleTouchStart}
      />
    ));
  }, [currentIndex, containerWidth, images, handleTouchStart]);

  return (
    <div className="container">
      {images.length > 0 && (
        <div
          className="slider-container"
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          ref={containerRef}
        >
          <div className="slider">{renderSlides}</div>
        </div>
      )}
    </div>
  );
};

export default Carousel;
