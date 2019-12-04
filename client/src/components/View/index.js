import React from 'react';
import { Context } from '../ContextMenu';
import jobs from '../../data/jobs';
import cooldowns from '../../data/cooldowns';
import Timeline from '../Timeline';
import uuid4 from 'uuid/v4';

// TODO: generate timelines
class View extends React.Component {
  constructor(props) {
    super(props);
    this.optimizedCooldowns = { ...cooldowns };
    for (const cooldown in cooldowns) {
      if (cooldowns[cooldown].shared) {
        cooldowns[cooldowns[cooldown].shared].sharesWith = cooldown;
      }
    }
  }

  state = {
    viewPlayer: false,
    player: null
  };

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

  buildAbilityTimelines = memberId => {
    const { party } = this.props;
    const filter = this.filterCooldowns(this.props.playerViewFilters);

    let i = 1;
    return jobs[party[memberId].job].cooldowns
      .filter(cooldown => !cooldowns[cooldown].shared)
      .map(cooldown => ({
        name: cooldown,
        cooldowns: party[memberId].cooldowns.filter(
          ({ name }) => name === cooldown || cooldowns[name].shared === cooldown
        ),
        shared:
          filter(this.optimizedCooldowns[cooldown].sharesWith) &&
          this.optimizedCooldowns[cooldown].sharesWith,
        who: memberId,
        key: memberId + i++
      }))
      .filter(filter);
  };

  buildJobTimelines = () => {
    const { party } = this.props;
    const filter = this.filterCooldowns(this.props.partyViewFilters);
    return Object.entries(party)
      .map(([memberId, member]) => ({
        name: member.job,
        cooldowns: member.cooldowns.filter(filter),
        shared: jobs[member.job].cooldowns.filter(filter),
        who: memberId,
        key: memberId
      }))
      .filter(({ who }) => party[who].enabled);
  };

  buildTimelines = () => {
    if (this.state.viewPlayer) {
      return this.buildAbilityTimelines(this.state.player);
    } else {
      return this.buildJobTimelines();
    }
  };

  render() {
    const players = this.props.players.map(
      playerId => this.props.party[playerId]
    );

    // if playerview, pass
    return (
      <Context.Consumer>
        {value => (
          <div
            className="timeline-container"
            style={{
              height: this.props.height
            }}
          >
            {this.buildTimelines().map((timeline, i) => (
              <Timeline {...timeline} contextMenuRef={value} key={i} />
            ))}
          </div>
        )}
      </Context.Consumer>
    );
  }
}

export default View;
