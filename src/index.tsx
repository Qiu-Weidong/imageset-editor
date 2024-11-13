import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import './index.css';
import { store } from "./app/store";
import reportWebVitals from './reportWebVitals';
import Start from './page/start/Start';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);


export const eel = window.eel;
eel.set_host( 'ws://localhost:8080' );

// 直接 eel.python_func 即可

root.render(
  <React.StrictMode>
    <Provider store={ store }>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Start />} />
        </Routes>
      </BrowserRouter>
    </Provider>
    
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
