import React from 'react';
import timestamp from '../../utils/timestamp';

class EventMarker extends React.Component {
  render() {
    const { mirror, details, top } = this.props;
    const event = Array.isArray(this.props.event)
      ? this.props.event
      : [this.props.event];

    return (
      <div
        className={'event-marker' + (details ? ' active' : '')}
        style={{ top }}
      >
        <div className={'mechanic-name' + (mirror ? ' right' : ' left')}>
          {details
            ? event.map((event, i) => (
                <div key={i}>
                  {event.text
                    .map((str, i) => {
                      const match = str.match(/(\w*)@(\w+)/);
                      return match
                        ? match[1] || match[2].replace(/_/g, ' ')
                        : str;
                    })
                    .join(' ')}
                </div>
              ))
            : null}
        </div>
        <div className={'timestamp' + (mirror ? ' left' : ' right')}>
          {details ? timestamp(event[0].time, true) : null}
        </div>
      </div>
    );
  }
}

export default EventMarker;
