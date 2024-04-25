import React from "react";
import Carousel, { CarouselProps } from "./Carousel";

const CarouselContainer: React.FC<CarouselProps> = (props) => {
  // This is just an example component for an example future structure
  // Any additional logic or state management (in the future) can be handled here
  return <Carousel {...props} />;
};

export default CarouselContainer;
