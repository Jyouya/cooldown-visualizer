import React from 'react';
import './index.scss';
import PartyView from './PartyView';
import JobPalette from './JobPalette';

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

  reset() {
    this.setState({ views: [this.props.party] });
  }

  render() {
    return this.props.isShown ? (
      <div className="modal" onClick={this.props.close}>
        <div className="content" onClick={e => e.stopPropagation()}>
          <div className="party-view-wrapper">
            {this.state.views.map((view, i, views) => (
              <PartyView
                key={i}
                party={view}
                dnd={this.dragAndDrop}
                setParty={party => {
                  this.setState({
                    views: [...views.slice(0, i), party, ...views.slice(i + 1)]
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
                  this.props.save(this.state.views[0]);
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
      </div>
    ) : null;
  }
}

export default PartySetup;
