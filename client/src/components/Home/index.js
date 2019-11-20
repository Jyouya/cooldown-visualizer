import React from 'react';
import Navbar from '../Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import EncounterMenu from '../EncounterMenu';
import AccountMenu from '../../containers/AccountMenu';

import './index.scss';
import API from '../../utils/API';

class Home extends React.Component {
  state = {
    files: [
      { fight: 'e2s', name: 'Voidwalker Placeholder', modified: Date.now(), id: 1 },
      { fight: 'e3s', name: 'Leviathan Placeholder', modified: Date.now(), id: 2 }
    ],
    loggedIn: false
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
              this.state.files.map(file => (
                <div className="file" key={file.id}>
                  <span className="fight">{file.fight}</span>
                  <span className="name">{file.name}</span>
                  <span className="modified">{Date(file.modified)}</span>
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
