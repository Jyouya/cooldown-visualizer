import React from 'react';
import ReactToolTip from 'react-tooltip';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';
import { Menu as ContextMenu, Context } from './components/ContextMenu';

import TimelineContainer from './components/TimelineContainer';
import EncounterTimeline from './components/EncounterTimeline';
import Mechanic from './components/Mechanic';
import EncounterOverlay from './components/EncounterOverlay';

import Navbar from './components/Navbar';
import Zoom from './components/Zoom';
import { Radio } from './components/Menu';
import Settings from './components/Settings';
import EncounterMenu from './components/EncounterMenu';
import AccountMenu from './components/AccountMenu';

import jobs from './data/jobs';
import cooldowns from './data/cooldowns';

import sortedInsert from './utils/sortedInsert';
import getResource from './utils/getResource';
import closestResource from './utils/closestResource';
import closestCharge from './utils/closestCharge';
import timestamp from './utils/timestamp';
import API from './utils/API';

import Cookies from 'js-cookie';
import uuid4 from 'uuid/v4';
// import dummyCooldown from './utils/dummyCooldown';
import './App.scss';

class App extends React.Component {
  constructor(props) {
    super(props);

    // Precalculate which cds share a timeline.
    this.optimizedCooldowns = { ...cooldowns };
    for (const cooldown in cooldowns) {
      if (cooldowns[cooldown].shared) {
        cooldowns[cooldowns[cooldown].shared].sharesWith = cooldown;
      }
    }

    this.contextRef = React.createRef();
    this.radio = new Radio();
  }

  cooldownId = 0;

  state = {
    loggedIn: false,
    party: [],
    encounter: {
      duration: 12000,
      startOfTime: -2500,
      mechanics: {},
      timeline: []
    },
    encounterDuration: 63500,
    startOfTime: -2500,
    zoom: 12000,
    snap: true,
    snapTo: 25,
    partyViewFilters: {
      raid: {
        include: true
      },
      heal: {
        include: false
      },
      shield: {
        include: false
      },
      gcd: {
        include: false,
        exclude: false
      },
      img: {
        alias: 'all',
        include: false
      }
    },
    playerViewFilters: {
      img: {
        alias: 'all',
        include: true
      },
      raid: {
        include: false
      },
      heal: {
        include: false
      },
      shield: {
        include: false
      },
      gcd: {
        include: false,
        exclude: false
      }
    }
  };

  componentDidMount() {
    // add ids to the dummy encounter
    // ! probably needs to be removed at some point
    // const party = [...this.state.party];
    // party.forEach(member =>
    //   member.cooldowns.forEach(cd => {
    //     if (!cd.id) cd.id = ++this.cooldownId;
    //   })
    // );
    // this.setState({ party });
    // console.log(Cookie.get('user'));

    const cookie = Cookies.get('user');

    if (cookie) {
      const user = JSON.parse(atob(cookie.split('.')[1]));

      if (Date.now() > user.exp * 1000) {
        // Token is expired
        Cookies.remove('user');
      } else {
        this.setState({ loggedIn: user.username });
      }
    }
  }

  buildDefaultParty = async () => {
    const username = this.state.loggedIn;
    if (username) {
      const { data: jobs } = await API.getDefaultParty();
      this.setState({
        party: jobs.map(job => ({
          enabled: true,
          job,
          cooldowns: [],
          id: uuid4()
        }))
      });
    } else {
      this.setState({
        party: this.state.party.map(({ job }) => ({
          enabled: true,
          job,
          cooldowns: [],
          id: uuid4()
        }))
      });
    }
  };

  loadFile = () => {};

  filterCooldowns(rules) {
    const includeRules = Object.entries(rules).filter(([, v]) => v.include);
    const excludeRules = Object.entries(rules).filter(([, v]) => v.exclude);
    return cooldown => {
      if (!cooldown) return;
      const name = typeof cooldown === 'string' ? cooldown : cooldown.name;
      return (
        includeRules.find(([rule]) => cooldowns[name][rule]) &&
        !excludeRules.find(([rule]) => cooldowns[name][rule])
      );
    };
  }

  buildAbilityTimelines = partyMember => {
    const { party } = this.state;
    const filter = this.filterCooldowns(this.state.playerViewFilters);

    return jobs[party[partyMember].job].cooldowns
      .filter(cooldown => !cooldowns[cooldown].shared)
      .map(cooldown => ({
        name: cooldown,
        cooldowns: party[partyMember].cooldowns.filter(
          ({ name }) => name === cooldown || cooldowns[name].shared === cooldown
        ),
        shared:
          filter(this.optimizedCooldowns[cooldown].sharesWith) &&
          this.optimizedCooldowns[cooldown].sharesWith,
        who: partyMember,
        raw: party[partyMember].cooldowns
      }))
      .filter(filter);
  };

  checkRecastCollision(timeline, target, time) {
    const cooldown = cooldowns[target.name];
    return timeline.find(
      cd =>
        cd.name === target.name && Math.abs(time - cd.time) < cooldown.recast
    );
  }

  checkResourceAvailability(timeline, target, time) {
    const resource = cooldowns[target.name].resource;
    return (
      resource &&
      resource.cost &&
      getResource({ ...target, time }, resource.cost.name, timeline) <
        resource.cost.amount({ ...target, time }, timeline)
    );
  }

  checkBusy(timeline, target, time) {
    const cooldown = cooldowns[target.name];
    return timeline.find(
      cd =>
        cd.name &&
        (cooldown[cooldowns[cd.name].channel] &&
          time > cd.time &&
          time < cd.time + cd.duration)
    );
  }

  checkRequirements(timeline, target, time) {
    const cooldown = cooldowns[target.name];
    const requires = cooldown.requires;
    return (
      !requires ||
      timeline.find(
        cd =>
          cd.name === requires && cd.time < time && time < cd.time + cd.duration
      )
    );
  }

  checkCharges(timeline, target, time) {
    const cdInfo = cooldowns[target.name];
    if (!cdInfo.charges) return true;
    const { max, time: recharge } = cdInfo.charges;
    return !Array.from(Array(max))
      .map((_, i) =>
        timeline.filter(
          cd =>
            cd.name === target.name &&
            cd.time < time + (max - i) * recharge &&
            cd.time > time - i * recharge
        )
      )
      .find(arr => arr.length === max);

    // return (
    //   timeline.filter(
    //     cd =>
    //       cd.name === target.name &&
    //       cd.time < time &&
    //       cd.time > time - cdInfo.charges.time * cdInfo.charges.max
    //   ).length < cdInfo.charges.max ||
    // );
  }

  buildJobTimelines = () => {
    const { party } = this.state;
    const filter = this.filterCooldowns(this.state.partyViewFilters);
    return party
      .map((member, i) => ({
        name: member.job,
        cooldowns: member.cooldowns.filter(filter),
        shared: jobs[member.job].cooldowns.filter(filter),
        who: i,
        raw: member.cooldowns
      }))
      .filter((_, i) => party[i].enabled);
  };

  addCooldown = (member, name, time, after) => {
    const party = [...this.state.party];
    const cd = cooldowns[name];
    const timeline = party[member].cooldowns;

    const duration = cd.variable ? cd.minMax(time, timeline)[0] : cd.duration;

    party[member].cooldowns = sortedInsert(
      timeline,
      { name, time, id: ++this.cooldownId, duration },
      (a, b) => (a.time > b.time ? 1 : -1)
    );

    this.setState({ party });
    after && after();
  };

  // TODO: cds that are depended on by others (e.g. Aetherflow) need to cascade their deletion
  removeCooldown = (member, id, after) => {
    const party = [...this.state.party];

    const i = party[member].cooldowns.findIndex(cd => cd.id === id);

    party[member].cooldowns.splice(i, 1);
    this.setState({ party });
    after && after();
  };

  // TODO: When moving aetherflow, dependant abilities may need to be removed
  // ** Rather than removing, consider giving them a red border to show that they're
  // ** unavailable
  moveCooldown = (member, id, time, after) => {
    if (time < this.state.startOfTime) time = this.state.startOfTime;
    if (time > this.state.encounterDuration - 100)
      time = this.state.encounterDuration - 100;
    time = this.snap(time);

    const party = [...this.state.party];
    let timeline = party[member].cooldowns;
    const targetIndex = timeline.findIndex(cd => cd.id === id);
    const target = timeline[targetIndex];

    const timeStack = [target.time];

    // Remove target from the party, so we're not comparing it to itself
    timeline[targetIndex] = {};

    const requires = this.checkRequirements(timeline, target, time);

    if (!requires) {
      // find nearest time when the required skill is active
      const requirement = cooldowns[target.name].requires;
      const windows = timeline.filter(({ name }) => name === requirement);

      const windowIndex = windows
        .map(({ time, duration }, i) =>
          Math.abs(target.time - time - duration / 2)
        )
        .reduce((iMin, x, i, arr) => (x < arr[iMin] ? i : iMin), 0);

      const window = windows[windowIndex];
      const left = window.time;
      const right = window.time + window.duration;

      if (Math.abs(left - time) > Math.abs(right - time)) time = right;
      else time = left;

      timeStack.push(time);
    }

    // Determine if the cooldown is available
    const unavailable = this.checkRecastCollision(timeline, target, time);

    const recast = cooldowns[target.name].recast;

    // // ! Does not check if the new time it moves to is available
    if (unavailable) {
      if (
        (time > unavailable.time &&
          unavailable.time + recast < this.state.encounterDuration) ||
        unavailable.time - recast < this.state.startOfTime
      )
        time = unavailable.time + recast;
      else time = unavailable.time - recast;
      timeStack.push(time);
    }

    if (!this.checkCharges(timeline, target, time)) {
      time = closestCharge(target, timeline);
      timeStack.push(time);
    }

    // check if we (or the pet) is channeling a skill
    const busy = this.checkBusy(timeline, target, time);

    if (busy) {
      if (
        time > busy.time + busy.duration / 2 &&
        busy.time + busy.duration < this.state.encounterDuration
      )
        time = busy.time + busy.duration;
      else time = busy.time - 1;
      timeStack.push(time);
    }

    if (this.checkResourceAvailability(timeline, target, time)) {
      time = closestResource(
        target,
        cooldowns[target.name].resource.cost.name,
        timeline,
        target.time
      );
      timeStack.push(time);
    }

    // Validate the new position, if not, find one that is valid
    timeStack.pop();
    while (timeStack.length > 0) {
      if (
        !(
          this.checkRecastCollision(timeline, target, time) ||
          this.checkResourceAvailability(timeline, target, time) ||
          this.checkBusy(timeline, target, time) ||
          this.checkRequirements(timeline, target, time) ||
          this.checkCharges(timeline, target, time)
        )
      ) {
        break;
      }
      time = timeStack.pop();
    }

    if (
      (targetIndex && timeline[targetIndex - 1].time > time) ||
      (targetIndex < timeline.length - 1 &&
        timeline[targetIndex + 1].time < time)
    ) {
      // Determine if the timeline needs to be resorted
      // Resort timeline
      // Remove targetIndex
      timeline.splice(targetIndex, 1);
      timeline = sortedInsert(timeline, { ...target, time }, (a, b) =>
        a.time > b.time ? 1 : -1
      );
    } else {
      // Reinsert target
      timeline[targetIndex] = { ...target, time };
    }

    party[member].cooldowns = timeline;

    this.setState({ party });

    after && after();
  };

  resizeCooldown = (member, id, duration, after) => {
    const party = [...this.state.party];
    const timeline = party[member].cooldowns;
    const targetIndex = timeline.findIndex(cd => cd.id === id);
    const cooldown = timeline[targetIndex];
    timeline[targetIndex] = {};
    const [min, max] = cooldowns[cooldown.name].minMax(cooldown.time, timeline);

    cooldown.duration = Math.min(Math.max(min, duration), max);
    timeline[targetIndex] = cooldown;
    this.setState({ party });

    after && after();
  };

  getTimestamp = json => {
    if (!json || this.state.party.length === 0) return;
    const cd = JSON.parse(json);
    const which = this.state.party[cd.who].cooldowns.find(x => x.id === cd.id);
    const time = which && which.time;
    return timestamp(time);
  };

  snap(time) {
    if (!this.state.snap) return time;
    const t = time + this.state.snapTo / 2;
    return t - (t % this.state.snapTo);
  }

  componentDidUpdate() {
    ReactToolTip.rebuild();
  }

  render() {
    const { zoom, encounterDuration, startOfTime } = this.state;
    const functions = {
      addCooldown: this.addCooldown,
      removeCooldown: this.removeCooldown,
      moveCooldown: this.moveCooldown,
      resizeCooldown: this.resizeCooldown
    };
    // TODO: Try to maintain scroll while zooming
    return (
      <BrowserRouter>
        <Context.Provider value={this.contextRef}>
          <ScrollSync>
            <div className="App">
              <Navbar>
                <div className="nav-left">
                  <EncounterMenu
                    radio={this.radio}
                    setEncounter={encounter => this.setState({ encounter })}
                    buildDefaultParty={this.buildDefaultParty}
                  />
                  <Settings
                    radio={this.radio}
                    settings={this.state}
                    updateSettings={settings => this.setState(settings)}
                  />
                </div>
                <div className="nav-center">
                  <Zoom setZoom={value => this.setState({ zoom: value })} />
                </div>
                <div className="nav-right">
                  <AccountMenu
                    isLoggedIn={this.state.loggedIn}
                    login={username => this.setState({ loggedIn: username })}
                  />
                </div>
              </Navbar>
              <ContextMenu ref={this.contextRef} />
              <ScrollSyncPane>
                <div className="timeline-area">
                  <Switch>
                    <Route
                      path="/:partyMember"
                      render={({ match }) => {
                        const { partyMember } = match.params;
                        return (
                          <TimelineContainer
                            timelines={this.buildAbilityTimelines(partyMember)}
                            showUnavailable
                            encounterDuration={encounterDuration}
                            startOfTime={startOfTime}
                            zoom={zoom}
                            functions={functions}
                          />
                        );
                      }}
                    />
                    <Route
                      path="/"
                      render={() => (
                        <TimelineContainer
                          timelines={this.buildJobTimelines()}
                          encounterDuration={encounterDuration}
                          startOfTime={startOfTime}
                          zoom={zoom}
                          functions={functions}
                        />
                      )}
                    />
                  </Switch>
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
                </div>
              </ScrollSyncPane>
              <ScrollSyncPane>
                <EncounterOverlay
                  encounter={this.state.encounter}
                  {...{ zoom, encounterDuration, startOfTime }}
                />
              </ScrollSyncPane>
              <ScrollSyncPane>
                <EncounterTimeline
                  encounter={this.state.encounter}
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
                        this.state.encounter.mechanics[mechanic].description
                          .split(/\s(?=\w*@)|(?<=@\w+)\s/)
                          .map((str, i) => {
                            const match = str.match(/(\w*)@(\w+)/);
                            return match ? (
                              <Mechanic
                                encounter={this.state.encounter}
                                name={match[2]}
                                alt={match[1] || null}
                                key={i}
                              />
                            ) : (
                              (i > 0 ? ' ' : '') +
                                str +
                                (i <
                                this.state.encounter.mechanics[mechanic]
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
            </div>
          </ScrollSync>
        </Context.Provider>
      </BrowserRouter>
    );
  }
}

export default App;
