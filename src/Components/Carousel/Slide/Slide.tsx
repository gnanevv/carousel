import React from "react";
import '../Carousel.css';
interface SlideProps {
  image: string;
  index: number;
  onTouchStart: (event: React.TouchEvent<HTMLDivElement>) => void;
}

const Slide: React.FC<SlideProps> = ({ image, index, onTouchStart }) => {
  return (
    <div className="slide" data-index={index} onTouchStart={onTouchStart}>
      <img src={image} alt={`Carousel slide ${index + 1}`} />
    </div>
  );
};

export default Slide;
