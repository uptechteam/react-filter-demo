import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import './SearchBox.scss';
// import PropTypes from 'prop-types';

class SearchBox extends Component {
  static propTypes = {
    sendSearchValue: PropTypes.func.isRequired,
    currentProcessingChunk: PropTypes.number.isRequired,
    chunksLength: PropTypes.number.isRequired,
    highLight: PropTypes.shape({}).isRequired,
    sendNextHighLightIndex: PropTypes.func.isRequired,
  };

  state = {
    inputValue: '',
    currentHighLight: 0,
    // just take that fact that initial index
    // of highlight 0 at SearchBox and at TablesView components
  };


  changeHandler = ({ target: input }) => {
    this.setState(() => ({
      inputValue: input.value,
    }));
  };

  keyPressHandler = ({ key }) => {
    if (key === 'Enter') {
      this.startSearch();
    }
  };

  highLightNavigation = (toTop) => {
    const {
      highLight: { allHighLight },
      sendNextHighLightIndex,
    } = this.props;
    let { currentHighLight } = this.state;

    if (toTop && currentHighLight > 0) {
      currentHighLight -= 1;
    }

    if (!toTop && currentHighLight < allHighLight - 1) {
      currentHighLight += 1;
    }
    this.setState(
      () => ({
        currentHighLight,
      }),
      () => {
        sendNextHighLightIndex(currentHighLight);
      },
    );
  };

  startSearch = () => {
    const { sendSearchValue } = this.props;
    const { inputValue } = this.state;
    sendSearchValue(inputValue);
    this.setState(() => ({
      currentHighLight: 0,
    }));
  };

  stopSearch = () => {
    const { sendSearchValue } = this.props;
    this.setState(
      () => ({
        inputValue: '',
        currentHighLight: 0,
      }),
      () => {
        sendSearchValue('');
      },
    );
  };

  renderSearchProgress = (currentChunk, chunksLength) => {
    if (currentChunk !== -1) {
      const progress = (currentChunk + 1) / chunksLength;
      return (
        <div className="progress-wrapper">
          <div
            style={{ transform: `scaleX(${progress})` }}
            className="progress"
          />
          <span className="progress-value">
            {Math.ceil(progress * 100)}
            %
          </span>
        </div>
      );
    }
    return null;
  };

  renderHighLightCount = (inputValue, currentHighLight, allHighLight) => {
    if (inputValue && allHighLight) {
      return (
        <div className="count-wrapper">
          <span>
            {currentHighLight + 1}
              /
            {allHighLight}
          </span>
        </div>
      );
    }
    return null;
  };

  render() {
    const { inputValue, currentHighLight } = this.state;
    const {
      currentProcessingChunk,
      chunksLength,
      highLight: { allHighLight },
    } = this.props;
    const searchWrapperClasses = classNames({
      'search-wrapper': true,
      'show-controls': !!inputValue,
      'is-searching': currentProcessingChunk !== -1,
    });
    const buttonDisabled = currentProcessingChunk !== -1;

    return (
      <div className={searchWrapperClasses}>
        {this.renderSearchProgress(currentProcessingChunk, chunksLength)}
        <div className="input-wrapper">
          <input
            disabled={buttonDisabled}
            onChange={(e) => {
              this.changeHandler(e);
            }}
            onKeyPress={this.keyPressHandler}
            type="text"
            value={inputValue}
            placeholder="Search..."
          />
          <div className="buttons-wrapper">
            <button
              type="button"
              onClick={() => {
                this.highLightNavigation(true);
              }}
              className="up-button"
            />
            <button
              type="button"
              onClick={() => {
                this.highLightNavigation(false);
              }}
              className="down-button"
            />
            <button
              type="button"
              onClick={this.stopSearch}
              className="clear-button"
            />
          </div>
          {this.renderHighLightCount(inputValue, currentHighLight, allHighLight)}
        </div>

        <button
          className="search-button"
          disabled={buttonDisabled}
          onClick={this.startSearch}
          type="button"
        >
          Search
        </button>
      </div>
    );
  }
}

export default SearchBox;
