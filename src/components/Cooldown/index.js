import React from 'react';
import cooldownData from '../../data/cooldowns';
import Resize from './Resize';
import './index.scss';

class Cooldown extends React.Component {
  constructor(props) {
    super(props);
    this.activeRef = React.createRef();
  }
  render() {
    const { name, time, id, duration } = this.props.cooldown;
    const data = cooldownData[name];
    // const start = (this.props.time / this.props.encounterDuration) * 100 + '%';
    return (
      <div
        className="cooldown"
        style={{
          top:
            ((time - Math.max(data.recast, duration)) /
              this.props.encounterDuration) *
              100 +
            '%',
          height:
            (Math.max(data.recast, duration) * 200) /
              this.props.encounterDuration +
            '%'
        }}
      >
        {this.props.showUnavailable && (
          <div
            className="cooldown-unavailable"
            {...(duration > data.recast
              ? {
                  style: {
                    height: (data.recast / duration) * 100 + '%',
                    top: 50 - (data.recast / duration) * 50 + '%'
                  }
                }
              : {})}
          />
        )}
        <div
          className={`cooldown-active${this.props.grabbing ? ' grabbing' : ''}`}
          ref={this.activeRef}
          data-for="cooldown"
          data-tip={JSON.stringify({
            who: this.props.who,
            id: id
          })}
          style={{
            height: (duration / Math.max(duration, data.recast)) * 50 + '%',
            backgroundColor: data.color || 'green'
          }}
        >
          {data.variable ? <Resize {...this.props} /> : null}
        </div>

        <div
          data-for="cooldown"
          data-tip={JSON.stringify({
            who: this.props.who,
            id: id
          })}
          className="icon-wrapper"
        >
          <img className="icon" src={data.img} alt={name} />
        </div>
      </div>
    );
  }
}

export default Cooldown;
