import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Start from './page/start/Start';
import Settings from './page/settings/Settings';
import Home from './page/detail/Home';
import Detail from './page/detail/Detail';



export const eel = window.eel;
eel.set_host('ws://localhost:8080');


export function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Start />} />
          <Route path='/home' element={<Home />} />
          <Route path='/settings' element={<Settings />} />
          <Route path='/detail' element={<Detail />} />
          <Route path="*" element={"404"}></Route>
        </Routes>
      </BrowserRouter>
      {/* 背景图片 */}
      <img src="https://images.unsplash.com/photo-1549388604-817d15aa0110"
        style={{
          zIndex: -1,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }} />
    </>
  );
}

export default App;
