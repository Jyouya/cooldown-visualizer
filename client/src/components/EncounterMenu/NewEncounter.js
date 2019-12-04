import React from 'react';
import PartyView from '../PartySetup/PartyView';
import JobPalette from '../PartySetup/JobPalette';
import Modal from '../Modal';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import EventEmitter from 'eventemitter3';
import API from '../../utils/API';
import './index.scss';

class NewEncounter extends React.Component {
  constructor(props) {
    super(props);

    this.dragAndDrop = new EventEmitter();
  }

  state = { views: [[]], party: {}, encounter: 'e2s', title: 'Untitled' };

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

  onChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  reset() {
    this.setState({ views: [[]], party: {} });
  }

  render() {
    console.log(this.state.party);
    // TODO: Add a view that shows members not currently in any views
    return (
      <Modal close={this.props.close} isShown={this.props.isShown}>
        <div className="new-encounter">
          <input
            className="title-input"
            name="title"
            value={this.state.title}
            placeholder="Title"
            onChange={this.onChange}
          />
          <div className="party-setup">
            <div className="party-view-wrapper">
              {this.state.views.map((view, i, views) => (
                <PartyView
                  key={i}
                  party={this.state.party}
                  view={view}
                  dnd={this.dragAndDrop}
                  setView={view => {
                    this.setState({
                      views: [...views.slice(0, i), view, ...views.slice(i + 1)]
                    });
                  }}
                  setParty={party => {
                    this.setState({
                      party: party
                    });
                  }}
                />
              ))}
              <div className="party-view">
                <FontAwesomeIcon icon={faPlus} />
              </div>
            </div>
            <div className="job-palette-wrapper">
              <select
                className="encounter-select"
                value={this.state.encounter}
                name="encounter"
                onChange={this.onChange}
              >
                {this.props.options.map(option => (
                  <option value={option.url}>{option.name}</option>
                ))}
              </select>

              <JobPalette dnd={this.dragAndDrop} />
              <div className="buttons">
                <button
                  onClick={async () => {
                    // this.props.setParty(this.state.party);
                    // this.props.setViews(this.state.views);
                    const { data } = await API.newEncounter(
                      this.state.encounter,
                      this.state.title,
                      Object.keys(this.state.party).map(id => ({
                        id,
                        job: this.state.party[id].job,
                        cooldowns: []
                      }))
                    );
                    const encounterId = data.encounterId;
                    // TODO: redirect to the url
                    this.props.history.push('/plan/' + encounterId);
                    this.props.close();
                  }}
                >
                  Create
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
      </Modal>
    );
  }
}

export default NewEncounter;
