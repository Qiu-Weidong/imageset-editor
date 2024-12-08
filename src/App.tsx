import { HashRouter as Router, Navigate, Route, Routes, } from 'react-router-dom';
import './App.css';
import Start from './page/start/Start';
import Overview from './page/imageset/Overview';

import Debug from './page/debug/Debug';
import NotFound from './page/notfound/NotFound';
import ImageSet from './page/imageset/ImageSet';
import SelectionEditor from './page/imageset/SelectionEditor';
import SimilarImageEditor from './page/imageset/SimilarImageEditor';

export function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/home' element={<Start />} />
          <Route path='/overview' element={<Overview />} />
          <Route path="/selection-editor" element={ <SelectionEditor enableFullscreen selectable /> } />
          <Route path='/similar-image-editor' element={ <SimilarImageEditor /> } />
          <Route path='/debug' element={<Debug />} />
          <Route path='/imageset/*' element={ <ImageSet /> } />
          <Route path="/" element={<Navigate to="/home" replace />} />
          
          <Route path="*" element={ <NotFound /> }></Route>
        </Routes>
      </Router>
      {/* 背景图片 */}
      <img src="https://images.unsplash.com/photo-1549388604-817d15aa0110" alt='bg'
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
