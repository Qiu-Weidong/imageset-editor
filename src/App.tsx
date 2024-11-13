import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

interface IAppState {
  message: string
  path: string
}


const defPath = '~';

export class App extends Component<{}, {}> {
  public state: IAppState = {
    message: `Click button to choose a random file from the user's system`,
    path: defPath,
  }



  public render() {
    // 调用 python 代码

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>{this.state.message}</p>
        </header>
      </div>
    );
  }
}

export default App;
