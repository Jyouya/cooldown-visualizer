import React from 'react';
import TimelineContainer from './components/TimelineContainer';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Menu as ContextMenu, Context } from './components/ContextMenu';

import jobs from './data/jobs';
import cooldowns from './data/cooldowns';
import './App.css';

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
  }

  cooldownId = 0;

  state = {
    party: [
      {
        enabled: true,
        job: 'GNB',
        cooldowns: [
          {
            name: 'Rampart',
            time: 90
          },
          {
            name: 'Aurora',
            time: 100
          },
          {
            name: 'Heart of Light',
            time: 130
          },
          {
            name: 'Rampart',
            time: 190
          }
        ]
      },
      {
        enabled: true,
        job: 'PLD',
        cooldowns: [
          {
            name: 'Passage of Arms',
            time: 40
          },
          {
            name: 'Sheltron',
            time: 50
          },
          {
            name: 'Intervention',
            time: 60
          }
        ]
      }
    ],
    encounterDuration: 600,
    zoom: 120,
    raidMitigationOnly: true
  };

  componentDidMount() {
    // add ids to the dummy encounter
    // ! probably needs to be removed at some point
    const party = [...this.state.party];
    party.forEach(member =>
      member.cooldowns.forEach(cd => {
        if (!cd.id) cd.id = ++this.cooldownId;
      })
    );

    this.setState({ party });
  }

  loadFile = () => {};

  buildAbilityTimelines = partyMember => {
    const { party } = this.state;
    return jobs[party[partyMember].job].cooldowns
      .filter(cooldown => !cooldowns[cooldown].shared)
      .map(cooldown => ({
        name: cooldown,
        cooldowns: party[partyMember].cooldowns.filter(
          ({ name }) => name === cooldown || cooldowns[name].shared === cooldown
        ),
        shared: this.optimizedCooldowns[cooldown].sharesWith,
        who: partyMember
      }));
  };

  buildJobTimelines = () => {
    const { party, raidMitigationOnly } = this.state;
    return party
      .map((member, i) => ({
        name: member.job,
        cooldowns: member.cooldowns.filter(
          cooldown => !raidMitigationOnly || cooldowns[cooldown.name].raid
        ),
        shared: jobs[member.job].cooldowns.filter(
          cooldown => !raidMitigationOnly || cooldowns[cooldown].raid
        ),
        who: i
      }))
      .filter((_, i) => party[i].enabled);
  };

  addCooldown = (member, name, time, after) => {
    console.log(member, name, time);
    const party = [...this.state.party];

    party[member].cooldowns = sortedInsert(
      party[member].cooldowns,
      { name, time, id: ++this.cooldownId },
      (a, b) => (a.time > b.time ? 1 : -1)
    );

    this.setState({ party });
    after && after();
  };

  removeCooldown = (member, id, after) => {
    const party = [...this.state.party];

    const i = party[member].cooldowns.findIndex(cd => cd.id === id);

    party[member].cooldowns.splice(i, 1);
    this.setState({ party });
    after && after();
  };

  moveCooldown = (member, id, time, after) => {
    const party = [...this.state.party];
    const timeline = party[member].cooldowns;
    let targetIndex = timeline.findIndex(cd => cd.id === id);
    const target = timeline[targetIndex];

    // Remove target from the party, so we're not comparing it to itself
    timeline[targetIndex] = {};

    // TODO: calculate closest allowed time for that cooldown
    // Determine if the cooldown is available
    const unavailable = timeline.find(
      cd =>
        cd.name === target.name &&
        Math.abs(time - cd.time) > cooldowns[target.name].recast
    );

    const recast = cooldowns[target.name].recast;

    // ! when adding times before 0, this will need to be changed to the start of the timeline
    const startOfTime = 0;

    if (unavailable) {
      if (time > unavailable.time) time = unavailable.time + recast;
      else if (unavailable.time - recast > startOfTime)
        time = unavailable.time - recast;
    }

    // TODO: determine if the timeline needs to be resorted

    // TODO: reinsert target
    after && after();
  };

  render() {
    const { zoom, encounterDuration } = this.state;
    const functions = {
      addCooldown: this.addCooldown,
      removeCooldown: this.removeCooldown
    };
    return (
      <BrowserRouter>
        <Context.Provider value={this.contextRef}>
          <div className="App">
            <ContextMenu ref={this.contextRef} />
            {/* ! Give timeline-area a decorative child to do the blur effect */}
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
                      zoom={zoom}
                      functions={functions}
                    />
                  )}
                />
              </Switch>
            </div>
          </div>
        </Context.Provider>
      </BrowserRouter>
    );
  }
}

// binary search from https://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers
function sortedInsert(array, element, compare) {
  let low = 0,
    high = array.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (compare(array[mid], element) < 0) low = mid + 1;
    else high = mid;
  }

  return [...array.slice(0, low), element, ...array.slice(low)];
}

export default App;
