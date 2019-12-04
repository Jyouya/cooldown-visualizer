import React from 'react';
import Navbar from '../Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import EncounterMenu from '../EncounterMenu';
import AccountMenu from '../../containers/AccountMenu';
import moment from 'moment';

import './index.scss';
import API from '../../utils/API';

class Home extends React.Component {
  state = {
    files: [],
    loggedIn: false,
    sort: 'Recent',
    sortDirection: 'descending'
  };

  componentDidMount() {
    if (this.props.isLoggedIn) {
      this.setState({ loggedIn: true });
      this.getFiles();
    }
  }

  componentDidUpdate() {
    if (this.props.isLoggedIn && !this.state.loggedIn) {
      this.setState({ loggedIn: true });
      this.getFiles();
    }
  }

  async getFiles() {
    const { data } = await API.getFiles();
    // console.log(data);
    this.setState({ files: data });
  }

  render() {
    return (
      <div className="App">
        <Navbar>
          <div className="nav-left">
            <button>
              <FontAwesomeIcon icon={faHome} /> Home
            </button>
            <EncounterMenu
              radio={this.radio}
              setEncounter={encounter => this.setState({ encounter })}
            />
          </div>
          <div className="nav-center"></div>
          <div className="nav-right">
            <AccountMenu />
          </div>
        </Navbar>
        <div className="file-menu">
          {this.props.isLoggedIn ? (
            this.state.files.length ? (
              this.state.files
                .sort((a, b) => (a.modified < b.modified ? 1 : -1))
                .map(file => (
                  <div className="file" key={file.id}>
                    <span className="fight">{file.fight}</span>
                    <span className="name">{file.name}</span>
                    <span className="modified">
                      {moment(file.modified).fromNow()}
                    </span>
                  </div>
                ))
            ) : (
              <div className="empty">Nothing to see here</div>
            )
          ) : (
            'Log in to see your saved encounters'
          )}
        </div>
      </div>
    );
  }
}

export default Home;
