import React, { Component } from 'react';
import logo from './assets/images/uptech-logo-color.png';
import './App.scss';
import TablesView from './components/TablesView/TablesView';
import { arraySlicer } from './utils/helpers';
import SearchBox from './components/SearchBox/SearchBox';

const LENGTH_OF_CHUNK = 100;

const data = require('./data.json');

class App extends Component {
  state = {
    chunkedUsers: [],
    searchValue: '',
    currentProcessingChunk: -1,
    chunksLength: 20,
    highLight: {},
    nextHighlightIndex: -1,
  };

  componentWillMount() {
    const chunkedUsers = arraySlicer(
      data.splice(0, data.length),
      LENGTH_OF_CHUNK,
    ); // get to function and delete array

    this.setState(({ chunkedUsers: prevChunkedUsers }) => ({
      chunkedUsers: [...prevChunkedUsers, ...chunkedUsers], // change to contact
      chunksLength: chunkedUsers.length,
    }));
  }

  getSearchValue = (value) => {
    this.setState(() => ({
      searchValue: value,
    }));
  }

  getCurrentProcessingChunk = (currentProcessingChunk) => {
    this.setState(() => ({
      currentProcessingChunk,
    }));
  }

  getHighLightInfo = (highLight) => {
    this.setState(() => ({
      highLight,
    }));
  }

  getNextHighLightIndex = (nextHighlightIndex) => {
    this.setState(() => ({
      nextHighlightIndex,
    }));
  }

  render() {
    const {
      chunkedUsers,
      searchValue,
      currentProcessingChunk,
      chunksLength,
      highLight,
      nextHighlightIndex,
    } = this.state;

    return (
      <div className="app-wrapper">
        <header className="header">
          <img className="main-logo" src={logo} alt="main logo" />
          <SearchBox
            highLight={highLight}
            sendNextHighLightIndex={this.getNextHighLightIndex}
            currentProcessingChunk={currentProcessingChunk}
            chunksLength={chunksLength}
            sendSearchValue={this.getSearchValue}
          />
        </header>
        <div className="app-body">
          <TablesView
            users={chunkedUsers}
            sendHighLightInfo={this.getHighLightInfo}
            nextHighlightIndex={nextHighlightIndex}
            sendCurrentProcessingChunk={this.getCurrentProcessingChunk}
            searchValue={searchValue}
          />
        </div>
      </div>
    );
  }
}

export default App;
