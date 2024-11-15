import { BrowserRouter, Navigate, Route, Routes, } from 'react-router-dom';
import './App.css';
import Start from './page/start/Start';
import Settings from './page/settings/Settings';
import Overview from './page/imageset/Overview';
import Detail from './page/detail/Detail';
import Debug from './page/debug/Debug2';


// 通过环境变量传递一个端口进来
const port = window.api_port || 1420;
export const eel = window.eel;
eel.set_host(`ws://localhost:${port}`);


export function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/home' element={<Start />} />
          <Route path='/overview' element={<Overview />} />
          <Route path='/settings' element={<Settings />} />
          <Route path='/detail' element={<Detail />} />
          <Route path='/debug' element={<Debug />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={"404"}></Route>
        </Routes>
      </BrowserRouter>
      {/* 背景图片 */}
      <img src="https://images.unsplash.com/photo-1549388604-817d15aa0110"
        style={{
          zIndex: -1,
          position: 'fixed',
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
