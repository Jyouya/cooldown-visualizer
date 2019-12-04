import React from 'react';

import cooldowns from '../../data/cooldowns';

import ReactToolTip from 'react-tooltip';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import { Menu as ContextMenu, Context } from '../ContextMenu';
import Settings from '../../containers/Settings';
import Navbar from '../Navbar';
import Zoom from '../Zoom';
import AccountMenu from '../../containers/AccountMenu';
import EncounterOverlay from '../EncounterOverlay';
import EncounterTimeline from '../EncounterTimeline';
import Mechanic from '../Mechanic';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

import uuid4 from 'uuid/v4';

import View from '../../containers/View';
import API from '../../utils/API';
import { Radio } from '../Menu';
import timestamp from '../../utils/timestamp';

const defaultPartySort = {
  PLD: 0,
  WAR: 1,
  DRK: 2,
  GNB: 3,
  WHM: 4,
  SCH: 5,
  AST: 6,
  MNK: 7,
  DRG: 8,
  NIN: 9,
  SAM: 10,
  BRD: 11,
  MCH: 12,
  DNC: 13,
  BLM: 14,
  SMN: 15,
  RDM: 16
};

class Encounter extends React.Component {
  constructor(props) {
    super(props);

    // Precalculate which cds share a timeline.
    this.optimizedCooldowns = { ...cooldowns };
    for (const cooldown in cooldowns) {
      if (cooldowns[cooldown].shared) {
        cooldowns[cooldowns[cooldown].shared].sharesWith = cooldown;
      }
    }

    // this.contextRef = React.createRef();
    this.radio = new Radio();
  }

  state = {
    loaded: false
  };

  componentDidMount() {
    console.log(this.props.encounterId);
    API.getEncounterPlan(this.props.encounterId).then(({ data }) => {
      console.log(data);
      const { mechanics, timelines } = data;
      const party = {};
      timelines.forEach(member => {
        party[member.id] = member;
        member.enabled = true;
      });

      this.props.setMechanics(mechanics);
      this.props.setParty(party);
      const view = Object.entries(party)
        .sort(([, member1], [, member2]) =>
          defaultPartySort[member1] > defaultPartySort[member2] ? 1 : -1
        )
        .map(([key]) => key);
      this.props.setViews([view]);
      this.setState({ loaded: true });
    });
  }

  componentDidUpdate() {
    ReactToolTip.rebuild();
  }

  getTimestamp = json => {
    if (!json) return;
    const cd = JSON.parse(json);
    if (!this.props.party[cd.who]) return;
    const which = this.props.party[cd.who].cooldowns.find(x => x.id === cd.id);
    const time = which && which.time;
    return timestamp(time);
  };

  newMember = job => ({
    enabled: true,
    job,
    cooldowns: [],
    id: uuid4()
  });

  render() {
    const { duration: encounterDuration, startOfTime } = this.props.encounter;

    console.log(this.props);
    const { zoom } = this.props.viewSettings;
    return (
      <ScrollSync>
        <div className="App">
          <Navbar>
            <div className="nav-left">
              <button>
                <FontAwesomeIcon icon={faHome} /> Home
              </button>
              {/* <EncounterMenu
                radio={this.radio}
                setEncounter={encounter => this.setState({ encounter })}
                buildDefaultParty={this.buildDefaultParty}
              /> */}
              {this.state.loaded ? <Settings radio={this.radio} /> : null}
            </div>
            <div className="nav-center">
              {this.state.loaded ? (
                <Zoom
                  setZoom={zoom =>
                    this.props.setViewSettings({
                      ...this.props.viewSettings,
                      zoom
                    })
                  }
                />
              ) : null}
            </div>
            <div className="nav-right">
              <AccountMenu />
            </div>
          </Navbar>
          {this.state.loaded ? (
            <>
              <ScrollSyncPane>
                <div className="timeline-area">
                  {this.props.views.map((view, i) => (
                    <View players={view} key={i} />
                  ))}
                </div>
                <ReactToolTip
                  id="cooldown"
                  place="right"
                  getContent={this.getTimestamp}
                  overridePosition={(
                    { left: l, top: t },
                    event,
                    currentTarget,
                    node
                  ) => {
                    const rects = currentTarget.getClientRects();
                    if (!rects[0]) return { left: l, top: t };
                    const { right, top } = rects[0];
                    return {
                      top: top - node.clientHeight / 2,
                      left: right
                    };
                  }}
                />
              </ScrollSyncPane>
              <ScrollSyncPane>
                <EncounterOverlay
                  encounter={this.props.encounter}
                  {...{ zoom, encounterDuration, startOfTime }}
                />
              </ScrollSyncPane>
              <ScrollSyncPane>
                <EncounterTimeline
                  encounter={this.props.encounter}
                  {...{ zoom, encounterDuration, startOfTime }}
                />
                <ReactToolTip
                  id="mechanic"
                  place="right"
                  effect="solid"
                  type="info"
                  delayHide={300}
                  delayShow={300}
                  delayUpdate={300}
                  getContent={mechanic => (
                    <div>
                      {mechanic &&
                        this.props.encounter.mechanics[mechanic].description
                          .split(/\s(?=\w*@)|(?<=@\w+)\s/)
                          .map((str, i) => {
                            const match = str.match(/(\w*)@(\w+)/);
                            return match ? (
                              <Mechanic
                                encounter={this.props.encounter}
                                name={match[2]}
                                alt={match[1] || null}
                                key={i}
                              />
                            ) : (
                              (i > 0 ? ' ' : '') +
                                str +
                                (i <
                                this.props.encounter.mechanics[mechanic]
                                  .description.length -
                                  1
                                  ? ' '
                                  : '')
                            );
                          })}
                    </div>
                  )}
                />
              </ScrollSyncPane>
            </>
          ) : null}
        </div>
      </ScrollSync>
    );
  }
}

export default Encounter;
