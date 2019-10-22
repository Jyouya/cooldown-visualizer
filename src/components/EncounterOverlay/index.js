import React from 'react';
import EventMarker from './EventMarker';

class EncounterOverlay extends React.Component {
  render() {
    const { startOfTime, encounterDuration } = this.props;
    const asdf = 3;
    return (
      <div className="encounter-overlay">
        {this.props.timeline.map((event, i) => {
          const e = Array.isArray(event) ? event[0] : event;
          const top =
            ((e.time - startOfTime) / (encounterDuration - startOfTime)) * 100 +
            '%';
          return <EventMarker key={i} top={top} event={event} />;
        })}
      </div>
    );
  }
}

export default EncounterOverlay;
