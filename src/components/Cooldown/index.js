import React from 'react';
import ReactToolTip from 'react-tooltip';
import cooldownData from '../../data/cooldowns.json';
import './index.css';

class Cooldown extends React.Component {
  render() {
    const data = cooldownData[this.props.name];
    // const start = (this.props.time / this.props.encounterDuration) * 100 + '%';
    return (
      <>
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
          {this.props.showUnavailable && (
            <div className="cooldown-unavailable" />
          )}
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
                (data.duration / Math.max(data.duration, data.recast)) * 50 +
                '%',
              backgroundColor: data.color || 'green'
            }}
          >
            <img className="icon" src={data.img} alt={this.props.name} />
          </div>
        </div>
        {/* <ReactToolTip
          key={this.props.id}
          id={`cooldown-${this.props.id}`}
          place="right"
          getContent={() => this.props.time}
          overridePosition={(_, __, currentTarget, node) => {
            let { right, top } = currentTarget.getClientRects()[0];
            const left = right;

            top = top - node.clientHeight / 2;

            return { top, left };
          }}
        /> */}
      </>
    );
  }
}

export default Cooldown;
