import { useState } from 'react';
import SearchInput from './Components/SearchInput/SearchInput';
import { Carousel } from './Components/Carousel';
import './App.css';

function App() {
  const [data, setData] = useState<{imageData:string[]}>({imageData:[]})
  const setImageData = (data:string[]) => {
    setData({imageData:data})
  }

  return (
    <div className="App">
      <header className="App-header">
      <SearchInput setImageData={setImageData}/>
        <Carousel images={data.imageData} />
      </header>
    </div>
  );
}

export default App;
