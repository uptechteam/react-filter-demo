import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import List from 'react-virtualized/dist/commonjs/List';
import SWorker from 'simple-web-worker';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import { mapByColor, scrollIt } from '../../utils/helpers';

import { COLORS, highLightConst, mappedUsersConst } from '../../utils/constants';
import './TablesView.scss';

const filterItems = (arr, searchValue) => {
  const lowerSearchValue = searchValue.toLowerCase();

  return arr.filter((obj) => {
    let found = false;
    Object.keys(obj).every((key) => {
      const viewObjectValue = obj[key];
      if (key !== 'id'
          && key !== 'ip_address'
          && String(viewObjectValue).toLowerCase().indexOf(lowerSearchValue) !== -1
      ) {
        found = true;
        return false;
      }
      return true;
    });
    return found;
  });
};

const actions = [{ message: 'filtering', func: filterItems }];

let worker;

class TablesView extends Component {
  static propTypes = {
    users: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.shape({}))).isRequired,
    searchValue: PropTypes.string,
    sendCurrentProcessingChunk: PropTypes.func.isRequired,
    sendHighLightInfo: PropTypes.func.isRequired,
    nextHighlightIndex: PropTypes.number.isRequired,
  };

  static defaultProps = {
    searchValue: '',
  };

  state = {
    users: {},
    highLight: {},
  };

  constructor(props) {
    super(props);
    this.tables = new Map();
  }

  componentDidMount() {
    const { users } = this.props;
    const mappedUsers = JSON.parse(JSON.stringify(mappedUsersConst));

    users.forEach((usersChunk) => {
      const mappedChunk = mapByColor(usersChunk);
      Object.keys(mappedUsers).forEach((key) => {
        mappedUsers[key].push(...mappedChunk[key]);
      });
    });

    this.setState(({ users: prevUsers }) => ({
      users: { ...prevUsers, ...mappedUsers },
      highLight: JSON.parse(JSON.stringify(highLightConst)),
    }));
  }

  componentDidUpdate(prevProps) {
    const {
      users,
      searchValue,
      sendHighLightInfo,
      nextHighlightIndex,
    } = this.props;

    if (searchValue !== prevProps.searchValue) {
      if (searchValue) {
        this.sequenceFilter(users, searchValue, users.length, 0);
      } else {
        const mappedUsers = JSON.parse(JSON.stringify(mappedUsersConst));
        const highLight = JSON.parse(JSON.stringify(highLightConst));

        users.forEach((usersChunk) => {
          const mappedChunk = mapByColor(usersChunk);
          Object.keys(mappedUsers).forEach((key) => {
            mappedUsers[key].push(...mappedChunk[key]);
          });
        });
        this.setState(
          () => ({
            users: mappedUsers,
            highLight,
          }),
          () => {
            sendHighLightInfo(highLight);
          },
        );
      }
    }

    if (nextHighlightIndex !== prevProps.nextHighlightIndex) {
      this.highLightController(
        prevProps.nextHighlightIndex,
        nextHighlightIndex,
      );
    }
  }

  highLightController = (prev, next) => {
    const { highLight } = this.state;
    const { highLightTypes } = highLight;
    let { currentType } = highLight;
    const prevType = currentType;
    const currentHighLightTypeIndex = highLightTypes.indexOf(currentType);

    if (next < prev) {
      if (highLight.currentHighLight > 0) {
        if (highLight.currentTypeCount > 0) {
          highLight.currentTypeCount -= 1;
          highLight.currentHighLight -= 1;
        } else if (highLightTypes[currentHighLightTypeIndex - 1]) {
          currentType = highLightTypes[currentHighLightTypeIndex - 1];
          highLight.currentType = currentType;
          highLight.currentTypeCount = highLight.typesCounts[currentType] - 1;
          highLight.currentHighLight -= 1;
        }
      }
    } else if (highLight.currentHighLight < highLight.allHighLight) {
      if (highLight.currentTypeCount < highLight.typesCounts[currentType] - 1) {
        highLight.currentTypeCount += 1;
        highLight.currentHighLight += 1;
      } else if (highLightTypes[currentHighLightTypeIndex + 1]) {
        currentType = highLightTypes[currentHighLightTypeIndex + 1];
        highLight.currentType = currentType;
        highLight.currentTypeCount = 0;
        highLight.currentHighLight += 1;
      }
    }

    this.setState(() => ({
      highLight,
    }), () => {
      if (currentType !== prevType) {
        scrollIt(this.tables.get(currentType), -100, 800);
      }
    });
  };

  highLighter = (value) => {
    const { searchValue } = this.props;
    if (value && searchValue) {
      const indexOfMatch = String(value)
        .toLowerCase()
        .indexOf(searchValue);

      if (indexOfMatch !== -1) {
        const firstPart = value.substring(0, indexOfMatch);
        const highLightPart = (
          <span className="high-light">
            {value.substring(indexOfMatch, indexOfMatch + searchValue.length)}
          </span>
        );
        const lastPart = value.substring(indexOfMatch + searchValue.length);
        return (
          <React.Fragment>
            {firstPart}
            {highLightPart}
            {lastPart}
          </React.Fragment>
        );
      }
      return value;
    }
    return value;
  };

  sequenceFilter = (arr, searchValue, arrLength, chunkIndex) => {
    if (!worker) {
      worker = SWorker.create(actions);
    }
    const { sendCurrentProcessingChunk, sendHighLightInfo } = this.props;
    let { users, highLight } = this.state;
    if (chunkIndex < arrLength) {
      worker
        .postMessage('filtering', [arr[chunkIndex], searchValue])
        .then((filteredArr) => {
          sendCurrentProcessingChunk(chunkIndex);
          if (chunkIndex === 0) {
            users = JSON.parse(JSON.stringify(mappedUsersConst));
            highLight = JSON.parse(JSON.stringify(highLightConst));
          }
          const mapped = mapByColor(filteredArr);

          Object.keys(users).forEach((key) => {
            const currentTypeCount = Object.keys(mapped[key]).length;
            if (currentTypeCount) {
              highLight.allHighLight += currentTypeCount;
              highLight.typesCounts[key] += currentTypeCount;
              users[key].push(...mapped[key]);
            }
          });
          this.setState(
            () => ({
              users,
              highLight,
            }),
            () => {
              const newIndex = chunkIndex + 1;
              this.sequenceFilter(arr, searchValue, arrLength, newIndex);
            },
          );
        })
        .catch(console.error);
    } else {
      worker = undefined;
      sendCurrentProcessingChunk(-1);

      // highLightTypes contain only types if them has founded by filtering.
      Object.keys(highLight.typesCounts).forEach((key) => {
        if (highLight.typesCounts[key]) {
          highLight.highLightTypes.push(key);
        }
        [highLight.currentType] = highLight.highLightTypes;
      });
      this.setState(
        () => ({
          highLight,
        }),
        () => {
          sendHighLightInfo(highLight);
        },
      );
    }
  };

  renderTableHeader = () => (
    <div className="table-header">
      <div>
        <span>#</span>
      </div>
      <div>
        <span>First Name</span>
      </div>
      <div>
        <span>Last Name</span>
      </div>
      <div>
        <span>Email</span>
      </div>
      <div>
        <span>Fav. color</span>
      </div>
    </div>
  );

  renderTableRow = ({ index, key, style }, type) => {
    const {
      users,
      highLight: { currentType, currentTypeCount },
    } = this.state;
    const data = users[type];

    const tableRowClasses = classNames({
      'table-row': true,
      'active-row': type === currentType && index === currentTypeCount,
    });
    return (
      <div key={key} style={style} className={tableRowClasses}>
        <div>
          <span>{index + 1}</span>
        </div>
        <div>
          <span>{this.highLighter(data[index].first_name)}</span>
        </div>
        <div>
          <span>{this.highLighter(data[index].last_name)}</span>
        </div>
        <div>
          <span>{this.highLighter(data[index].email)}</span>
        </div>
        <div>
          <span style={{ borderBottom: `2px solid ${data[index].fav_color}` }}>
            {this.highLighter(data[index].fav_color)}
          </span>
        </div>
      </div>
    );
  };

  renderTable = (type) => {
    const { users, highLight } = this.state;
    const scrollToRow = type === highLight.currentType ? highLight.currentTypeCount : 0;
    return (
      <div
        ref={(el) => {
          this.tables.set(type, el);
        }}
        className="table-wrapper"
      >
        {this.renderTableHeader()}

        <div className="table-body">
          <AutoSizer>
            {({ width, height }) => (
              <List
                width={width}
                height={height}
                estimatedRowHeight={40}
                rowHeight={40}
                rowRenderer={params => this.renderTableRow(params, type)}
                rowCount={users[type] ? users[type].length : 0}
                scrollToIndex={scrollToRow}
                scrollToAlignment="center"
              />
            )}
          </AutoSizer>
        </div>
      </div>
    );
  };

  render() {
    // create renderTable <div className = table
    return (
      <div className="tables">
        {this.renderTable('Other')}
        {this.renderTable(COLORS.VIOLET)}
        {this.renderTable(COLORS.RED)}
        {this.renderTable(COLORS.YELLOW)}
        {this.renderTable(COLORS.CRIMSON)}
      </div>
    );
  }
}

export default TablesView;
