import React from 'react';
import './index.scss';
import PartyView from './PartyView';
import JobPalette from './JobPalette';
import Modal from '../Modal';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import EventEmitter from 'eventemitter3';

class PartySetup extends React.Component {
  constructor(props) {
    super(props);

    this.dragAndDrop = new EventEmitter();
  }

  state = { views: [] };

  componentDidMount() {
    // this.setState({ views: this.props.views });
    this.reset();
  }

  componentDidUpdate({ isShown: wasShown }) {
    const { isShown } = this.props;
    if (isShown !== wasShown) {
      this.reset();
    }
  }

  reset() {
    this.setState({
      views: this.props.views || [],
      party: this.props.party || {}
    });
  }

  render() {
    // TODO: Add a view that shows members not currently in any views
    return (
      <Modal close={this.props.close} isShown={this.props.isShown}>
        <div className="party-setup">
          <div className="party-view-wrapper">
            {this.state.views.map((view, i, views) => (
              <PartyView
                key={i}
                party={this.props.party}
                view={view}
                dnd={this.dragAndDrop}
                setView={view => {
                  this.setState({
                    views: [...views.slice(0, i), view, ...views.slice(i + 1)]
                  });
                }}
              />
            ))}
            <div className="party-view">
              <FontAwesomeIcon icon={faPlus} />
            </div>
          </div>
          <div className="job-palette-wrapper">
            <JobPalette dnd={this.dragAndDrop} />
            <div className="buttons">
              <button
                onClick={() => {
                  this.props.setParty(this.state.party);
                  this.props.setViews(this.state.views);
                  this.props.close();
                }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  this.props.close();
                  this.reset();
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

export default PartySetup;
