import React from 'react';
import EventMarker from './EventMarker';

import closestIndex from '../../utils/closestIndex';
import './index.scss';

class EncounterOverlay extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  state = { mirror: false, shown: null };

  pixToTime = px => {
    const height = this.myRef.current.clientHeight;
    const duration = this.props.encounterDuration - this.props.startOfTime;
    const time = (px / height) * duration;
    return Math.floor(time);
  };

  getTime = event => {
    const clientY = event.nativeEvent
      ? event.nativeEvent.clientY
      : event.clientY;
    const timelineY = clientY - this.myRef.current.getClientRects()[0].top;
    return this.pixToTime(timelineY) + this.props.startOfTime;
  };

  componentDidMount() {
    document.addEventListener('mousemove', this.onMouseMove, true);
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.onMouseMove);
  }

  onMouseMove = event => {
    const { left, right } = this.myRef.current.getClientRects()[0];
    const timeline = this.props.encounter.timeline;
    let { shown, mirror } = this.state;
    if (event.clientX > left && event.clientX < right) {
      // Binary search timeline
      const time = this.getTime(event);

      const index = closestIndex(
        timeline,
        { time },
        (a, b) =>
          (Array.isArray(a) ? a[0].time : a.time) -
          (Array.isArray(b) ? b[0].time : b.time)
      );
      const e = timeline[index];
      // console.log(Math.abs(time - (Array.isArray(e) ? e[0].time : e.time)));
      if (Math.abs(time - (Array.isArray(e) ? e[0].time : e.time)) < 300)
        shown = index;
      else shown = null;
    } else {
      shown = null;
    }

    if (event.clientX > (right + left) / 2) mirror = false;
    else mirror = true;

    this.setState({ mirror, shown });
  };

  render() {
    const { startOfTime, encounterDuration, zoom } = this.props;
    return (
      <div className="encounter-overlay-container" disabled>
        <div
          className="encounter-overlay"
          style={{
            height: ((encounterDuration - startOfTime) / zoom) * 100 + '%'
          }}
          ref={this.myRef}
          disabled
        >
          {this.props.encounter.timeline.map((event, i) => {
            const e = Array.isArray(event) ? event[0] : event;
            const top =
              ((e.time - startOfTime) / (encounterDuration - startOfTime)) *
                100 +
              '%';
            return (
              <EventMarker
                key={i}
                top={top}
                event={event}
                mirror={this.state.mirror}
                details={this.state.shown === i}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

export default EncounterOverlay;
