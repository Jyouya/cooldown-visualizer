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

import jobs from './data/jobs';
import cooldowns from './data/cooldowns';

import sortedInsert from './utils/sortedInsert';
import getResource from './utils/getResource';
import closestResource from './utils/closestResource';
import closestCharge from './utils/closestCharge';
import timestamp from './utils/timestamp';
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
      // {
      //   enabled: true,
      //   job: 'WHM',
      //   cooldowns: []
      // },
      {
        enabled: true,
        job: 'SCH',
        cooldowns: []
      },
      {
        enabled: true,
        job: 'AST',
        cooldowns: []
      },
      {
        enabled: true,
        job: 'MNK',
        cooldowns: []
      },
      {
        enabled: true,
        job: 'DRG',
        cooldowns: []
      },
      {
        enabled: true,
        job: 'BRD',
        cooldowns: []
      },
      {
        enabled: true,
        job: 'SMN',
        cooldowns: []
      }
    ],
    encounter: {
      duration: 63500,
      startOfTime: -2500,
      mechanics: {
        'Doomvoid Cleaver': {
          style: { color: 'yellow' },
          description:
            "Narrow Cone AoE's to all players; must avoid clipping; spawns 8 Nyxes@Nyx after damage"
        },
        'Doomvoid Slicer': {
          style: { color: 'green' },
          description:
            'Donut shaped AoE with safe area under the boss; spawns 8 Nyxes@Nyx after AoE'
        },
        'Doomvoid Guillotine': {
          style: { color: 'green' },
          description:
            "Big Line AoE through the boss's front and back; spawns 8 Nyxes@Nyx after AoE"
        },
        Nyx: {
          style: { color: 'purple' },
          description:
            'Spawnd by Doomvoid spells; cannot be targetted; touching inflicts Diabolic Curse and Damage Down debuffs'
        },
        'Dark Fire III': {
          style: { color: 'cadetblue' },
          description: 'Circle AoE on random players'
        },
        'Spell-in-Waiting': {
          style: { color: '#1A5276' },
          description: 'Delays next spell cast'
        },
        'Unholy Darkness': {
          style: { color: 'cadetblue' },
          description: 'Stacking AoE on a random player'
        },
        'Punishing Ray': {
          style: { color: 'yellow' },
          description:
            '8 dark meteor circles spawn; requires all players inside every circle'
        },
        Shadowflame: {
          style: { color: 'orange' },
          description: 'Tankbuster hits both tanks'
        },
        'Hell Wind': {
          style: { color: 'cadetblue' },
          description: 'Brings target player to 1 HP'
        },
        Entropy: {
          style: { color: 'red' },
          description: 'High raid damage'
        },
        Shadoweye: {
          style: { color: '#1A5276' },
          description: 'Petrifies any player looking toward the target'
        },
        'Hand of Erebos': {
          style: { color: '#1A5276' },
          description:
            'Boss tethers to The Hand of Erebos and readies either @Empty_Rage or @Empty_Hate'
        },
        'Empty Rage': {
          style: { color: 'green' },
          description:
            'Huge AoE around Hand of Erebos; indicated by Orange Tether'
        },
        'Empty Hate': {
          style: { color: 'red' },
          description:
            'Knockback with mid raid damage; indicated by Black Tether'
        },
        Equillibrium: {
          style: { color: '#1A5276' },
          description:
            '4 players marked with Darkness, 4 marked with light; make pairs of light and darkness'
        },
        Flare: {
          style: { color: 'cadetblue' },
          description: 'Proximity-based damage from target'
        },
        Quietus: {
          style: { color: 'red' },
          description: 'High raid damage'
        },
        'Cycle of Retribution': {
          style: { color: '#1A5276' },
          description:
            'A combination of Doomvoid Slicer@Doomvoid_Slicer > Cleaver@Doomvoid_Cleaver > Guillotine@Doomvoid_Guillotine'
        },
        'Cycle of Chaos': {
          style: { color: '#1A5276' },
          description:
            'A combination of Doomvoid Guillotine@Doomvoid_Guillotine > Slicer@Doomvoid_Slicer > Cleaver@Doomvoid_Cleaver'
        }
      },
      timeline: [
        // { time: 0, phase: 1, text: ''},
        { time: 0, text: ['Pull'] },
        { time: 900, text: ['Doomvoid Cleaver'] },
        { time: 2400, text: ['Unholy Darkness'] },
        { time: 3000, text: ['Doomvoid Slicer', 'or', 'Doomvoid Guillotine'] },
        { time: 4200, text: ['Dark Fire III', 'x4'] },
        [
          { time: 5800, text: ['Spell-in-Waiting'] },
          { time: 5800, text: ['Punishing Ray', 'appears'] }
        ],
        { time: 6100, text: ['Unholy Darkness', '(delayed)'] },
        { time: 6800, text: ['Punishing Ray', 'resolves'] },
        { time: 7100, text: ['Spell-in-Waiting'] },
        { time: 7400, text: ['Dark Fire III', 'x4 (delayed)'] },
        { time: 8400, text: ['Spell-in-Waiting'] },
        { time: 8800, text: ['Shadoweye', '(delayed)'] },
        { time: 9400, text: ['Dark Fire III', 'x4 resolves'] },
        { time: 10400, text: ['Hell Wind', 'x2'] },
        { time: 10500, text: ['Unholy Darkness', '+', 'Shadoweye', 'resolve'] },
        { time: 11900, text: ['Shadowflame'] },
        { time: 13100, text: ['Entropy'] },

        [
          { time: 14100, text: ['Hand of Erebos'] },
          { time: 14100, text: ['Empty Rage'] }
        ],
        { time: 14600, text: ['Doomvoid Guillotine'] },
        { time: 15400, text: ['Doomvoid Slicer'] },
        [
          { time: 16200, text: ['Hand of Erebos'] },
          { time: 16200, text: ['Empty Hate'] }
        ],
        { time: 17300, text: ['Doomvoid Cleaver'] },
        { time: 18800, text: ['Shadowflame'] },
        { time: 20000, text: ['Entropy'] },

        { time: 20600, text: ['Spell-in-Waiting'] },
        { time: 20900, text: ['Hell Wind', 'x2 (delayed)'] },
        { time: 22300, text: ['Flare', 'x3'] },
        { time: 22700, text: ['Spell-in-Waiting'] },
        { time: 23100, text: ['Shadoweye', '(delayed)'] },
        { time: 23500, text: ['Punishing Ray', 'appears'] },
        { time: 24100, text: ['Hell Wind', 'x2 resolves'] },
        { time: 24700, text: ['Punishing Ray', '+', 'Shadoweye', 'resolve'] },
        { time: 25900, text: ['Shadowflame'] },
        { time: 27000, text: ['Entropy'] },

        { time: 28100, text: ['Equillibrium'] },
        { time: 28300, text: ['Doomvoid Cleaver'] },
        { time: 29300, text: ['Unholy Darkness'] },
        { time: 30100, text: ['Doomvoid Slicer', 'or', 'Doomvoid Guillotine'] },
        { time: 32800, text: ['Shadowflame'] },
        { time: 33900, text: ['Entropy'] },

        { time: 34600, text: ['Spell-in-Waiting'] },
        { time: 34900, text: ['Flare', 'x3 (delayed)'] },
        [
          { time: 35600, text: ['Hand of Erebos'] },
          { time: 35600, text: ['Empty Rage', 'or', 'Empty Hate'] }
        ],
        { time: 36000, text: ['Spell-in-Waiting'] },
        { time: 36300, text: ['Unholy Darkness', '(delayed)'] },
        { time: 37300, text: ['Spell-in-Waiting'] },
        { time: 37600, text: ['Flare', 'x3 (delayed)'] },
        { time: 37900, text: ['1st', 'Flare', 'x3 resolves'] },
        { time: 38500, text: ['Unholy Darkness', 'resolves'] },
        { time: 39800, text: ['Shadowflame'] },
        { time: 40700, text: ['Spell-in-Waiting'] },
        { time: 41000, text: ['Shadoweye', 'x2 (delayed)'] },
        { time: 42000, text: ['Spell-in-Waiting'] },
        { time: 42300, text: ['Dark Fire III', 'x4 (delayed)'] },
        { time: 42400, text: ['Flare', 'x3', '+', 'Shadoweye', 'x2 resolve'] },
        { time: 43600, text: ['Dark Fire III', 'x4 resolves'] },
        { time: 43800, text: ['Punishing Ray', 'appears'] },
        { time: 44300, text: ['Equillibrium'] },
        { time: 44900, text: ['Punishing Ray', 'resolves'] },
        { time: 45300, text: ['Doomvoid Cleaver'] },
        { time: 46800, text: ['Shadowflame'] },

        { time: 49800, text: ['Quietus'] },
        [
          {
            time: 50600,
            text: ['Cycle of Retribution', 'or', 'Chaos@Cycle_of_Chaos']
          },
          {
            time: 50600,
            text: [
              'Slicer@Doomvoid_Slicer',
              '|',
              'Guillotine@Doomvoid_Guillotine'
            ]
          }
        ],
        {
          time: 50900,
          text: ['Cleaver@Doomvoid_Cleaver', '|', 'Slicer@Doomvoid_Slicer']
        },
        {
          time: 51200,
          text: [
            'Guillotine@Doomvoid_Guillotine',
            '|',
            'Cleaver@Doomvoid_Cleaver'
          ]
        },
        [
          {
            time: 53000,
            text: ['Cycle of Retribution', 'or', 'Chaos@Cycle_of_Chaos']
          },
          {
            time: 53000,
            text: [
              'Slicer@Doomvoid_Slicer',
              '|',
              'Guillotine@Doomvoid_Guillotine'
            ]
          }
        ],
        {
          time: 53300,
          text: ['Cleaver@Doomvoid_Cleaver', '|', 'Slicer@Doomvoid_Slicer']
        },
        {
          time: 53600,
          text: [
            'Guillotine@Doomvoid_Guillotine',
            '|',
            'Cleaver@Doomvoid_Cleaver'
          ]
        },
        { time: 55700, text: ['Quietus'] },
        [
          {
            time: 56700,
            text: ['Cycle of Retribution', 'or', 'Chaos@Cycle_of_Chaos']
          },
          {
            time: 56700,
            text: [
              'Slicer@Doomvoid_Slicer',
              '|',
              'Guillotine@Doomvoid_Guillotine'
            ]
          }
        ],
        {
          time: 57000,
          text: ['Cleaver@Doomvoid_Cleaver', '|', 'Slicer@Doomvoid_Slicer']
        },
        {
          time: 57300,
          text: [
            'Guillotine@Doomvoid_Guillotine',
            '|',
            'Cleaver@Doomvoid_Cleaver'
          ]
        },
        { time: 59200, text: ['Quietus'] },
        { time: 60100, text: ['Quietus'] },
        { time: 61000, text: ['Quietus'] },
        { time: 63000, text: ['Quietus', '(Enrage)'] }
      ]
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
    if (!json) return;
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
    return (
      <BrowserRouter>
        <Context.Provider value={this.contextRef}>
          <ScrollSync>
            <div className="App">
              <Navbar />
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
