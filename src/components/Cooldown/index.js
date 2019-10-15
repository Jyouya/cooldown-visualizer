import React from 'react';
import cooldownData from '../../data/cooldowns.json';
import './index.css';

class Cooldown extends React.Component {
  render() {
    const data = cooldownData[this.props.name];
    // const start = (this.props.time / this.props.encounterDuration) * 100 + '%';
    return (
      <div
        className="cooldown"
        style={{
          top:
            ((this.props.time - data.recast) / this.props.encounterDuration) *
              100 +
            '%',
          height:
            Math.max(
              data.recast / this.props.encounterDuration,
              data.duration / this.props.encounterDuration
            ) *
              200 +
            '%'
        }}
      >
        {this.props.showUnavailable && <div className="cooldown-unavailable" />}
        <div
          className="cooldown-active"
          data-for="cooldown"
          data-tip={JSON.stringify({
            who: this.props.who,
            id: this.props.id
          })}
          // data-event="mouseDown"
          // data-event-off="mouseUp"
          style={{
            height:
              (data.duration / Math.max(data.duration, data.recast)) * 50 + '%',
            backgroundColor: data.color || 'green'
          }}
        >
          <img className="icon" src={data.img} alt={this.props.name} />
        </div>
      </div>
    );
  }
}

export default Cooldown;
