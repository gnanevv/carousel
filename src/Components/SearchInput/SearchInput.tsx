import { SyntheticEvent, useRef } from "react";
import axios from "axios";
import "./SearchInput.css";
const API_KEY = "20524329-a56f712174c95d9a33f77f075"; // hardcoded my pixabay API key for ease of use to you 

const SearchInput = (props: { setImageData: (data: string[]) => void }) => {
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const changeHandler = (e: SyntheticEvent) => {
    clearTimeout(timeout.current as NodeJS.Timeout);

    // Query images after timeout
    timeout.current = setTimeout(async () => {
      const el = e.target as HTMLInputElement;
      if (el.value.length > 0) {
        const res = await axios.get("https://pixabay.com/api/", {
          params: {
            key: API_KEY,
            q: encodeURIComponent(el.value),
            image_type: "photo",
            per_page: 10, // Number of images to return can be modified
            orientation: "vertical", // Orientation can be modified but Carousel is styled to work with all kinds of resolitons
          },
        });
        props.setImageData(res.data.hits.map((it: any) => it.webformatURL));
      }
    }, 600);
  };

  return (
    <input className="search-input" type="text" placeholder="Search Images" onChange={changeHandler} />
  );
};

export default SearchInput;
