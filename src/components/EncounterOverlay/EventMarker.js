import React from 'react';
import timestamp from '../../utils/timestamp';

class EventMarker extends React.Component {
  state = { hover: false, mirror: false };

  render() {
    const { mirror, hover } = this.state;
    const top = this.props.top;
    const event = Array.isArray(this.props.event)
      ? this.props.event
      : [this.props.event];

    return (
      <div className="event-marker" style={{ top }}>
        <div className="hover-box"></div>
        <div className={'mechanic-name' + mirror ? ' right' : ' left'}>
          {hover
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
        <div className={'timestamp' + mirror ? ' left' : ' right'}>
          {hover ? timestamp(event[0].time, true) : null}
        </div>
      </div>
    );
  }
}

export default EventMarker;
