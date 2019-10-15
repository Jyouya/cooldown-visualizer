import React from 'react';
import TimelineContainer from './components/TimelineContainer';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import ReactToolTip from 'react-tooltip';
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
        cooldowns: []
      },
      {
        enabled: true,
        job: 'PLD',
        cooldowns: []
      },
      {
        enabled: true,
        job: 'WHM',
        cooldowns: []
      }
    ],
    encounterDuration: 60000,
    zoom: 12000,
    raidMitigationOnly: true,
    snap: true,
    snapTo: 25,
    // globalFilters: {
    //   raid: {
    //     enabled: false
    //   },
    //   heal: {
    //     enabled: false
    //   },
    //   shield: {
    //     enabled: false
    //   },
    //   img: {
    //     alisas: 'all',
    //     enabled: false
    //   }
    // },
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
        alisas: 'all',
        include: false
      }
    },
    playerViewFilters: {
      img: {
        alisas: 'all',
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
    const party = [...this.state.party];
    party.forEach(member =>
      member.cooldowns.forEach(cd => {
        if (!cd.id) cd.id = ++this.cooldownId;
      })
    );

    this.setState({ party });
  }

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
        who: partyMember
      }))
      .filter(filter);
  };

  buildJobTimelines = () => {
    const { party, raidMitigationOnly } = this.state;
    const filter = this.filterCooldowns(this.state.partyViewFilters);
    return party
      .map((member, i) => ({
        name: member.job,
        cooldowns: member.cooldowns.filter(filter),
        shared: jobs[member.job].cooldowns.filter(filter),
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
    // ! when adding times before 0, this will need to be changed to the start of the timeline
    const startOfTime = 0;
    if (time < startOfTime) time = startOfTime;
    time = this.snap(time);

    const party = [...this.state.party];
    let timeline = party[member].cooldowns;
    const targetIndex = timeline.findIndex(cd => cd.id === id);
    const target = timeline[targetIndex];

    // Remove target from the party, so we're not comparing it to itself
    timeline[targetIndex] = {};

    // Determine if the cooldown is available
    const unavailable = timeline.find(
      cd =>
        cd.name === target.name &&
        Math.abs(time - cd.time) < cooldowns[target.name].recast
    );

    const recast = cooldowns[target.name].recast;

    // ! Does not check if the new time it moves to is available
    if (unavailable) {
      if (time > unavailable.time || unavailable.time - recast < startOfTime)
        time = unavailable.time + recast;
      else time = unavailable.time - recast;
    }

    // Determine if the timeline needs to be resorted
    if (
      (targetIndex && timeline[targetIndex - 1].time > time) ||
      (targetIndex < timeline.length - 1 &&
        timeline[targetIndex + 1].time < time)
    ) {
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

  getTimestamp = json => {
    if (!json) return;
    const cd = JSON.parse(json);
    const which = this.state.party[cd.who].cooldowns.find(x => x.id === cd.id);
    const time = which && which.time;
    return (
      Math.floor(time / 6000)
        .toString()
        .padStart(2, '0') +
      ':' +
      ((time % 6000) / 100).toFixed(2).padStart(5, '0')
    );
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
    const { zoom, encounterDuration } = this.state;
    const functions = {
      addCooldown: this.addCooldown,
      removeCooldown: this.removeCooldown,
      moveCooldown: this.moveCooldown
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
              <ReactToolTip
                id="cooldown"
                place="right"
                getContent={this.getTimestamp}
                overridePosition={(_, __, currentTarget, node) => {
                  const { right, top } = currentTarget.getClientRects()[0];
                  return { top: top - node.clientHeight / 2, left: right };
                }}
              />
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
