import React from 'react';
import timestamp from '../../utils/timestamp';

class TimelineEvent extends React.Component {
  eventText(event) {
    return event.text.map((text, i) => {
      const match = text.match(/(\w*)@(\w+)/);
      const name = match ? match[2].replace(/_/g, ' ') : text;
      const data = this.props.encounter.mechanics[name];
      return (
        <span
          className={data ? 'info' : null}
          style={data ? data.style : null}
          key={i}
          data-tip={data ? name : null}
          data-for={data ? 'mechanic' : null}
        >
          {i > 0 ? ' ' : null}
          {match ? match[1].replace(/_/g, ' ') : text}
        </span>
      );
    });
  }

  render() {
    const { event, top } = this.props;
    // const events = Array.isArray(event) ? event : [event];
    const style = {
      top: top * 100 + '%'
    };
    return (
      <div className="event" style={style}>
        <span className="time">{timestamp(event.time, true)}</span>
        <span className="text">{this.eventText(event)}</span>
      </div>
    );
  }
}

export default TimelineEvent;
