import React from 'react';
import TimelineEvent from './TimelineEvent';
import './index.scss';

class EncounterTimeline extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  state = {
    lineHeight: 0.01
  };

  componentDidMount() {
    this.setState({ lineHeight: 22 / this.myRef.current.offsetHeight });
  }

  componentDidUpdate() {
    const newHeight = 22 / this.myRef.current.offsetHeight;
    if (this.state.lineHeight !== newHeight)
      this.setState({ lineHeight: newHeight });
  }

  render() {
    const { encounterDuration, startOfTime, zoom, encounter } = this.props;
    console.log(encounter);
    const lineHeight = this.state.lineHeight;
    let prev = -1000;
    return (
      <div className="encounter-timeline-container">
        <div
          className="encounter-timeline"
          ref={this.myRef}
          style={{
            height: ((encounterDuration - startOfTime) / zoom) * 100 + '%'
          }}
        >
          {encounter.mechanicTimeline.flat().map((event, i) => {
            let top =
              (event.time - startOfTime) / (encounterDuration - startOfTime);
            if (top < prev + lineHeight) top = prev + lineHeight;

            prev = top;

            return (
              <TimelineEvent
                key={i}
                {...{ event, startOfTime, encounterDuration, encounter, top }}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

export default EncounterTimeline;
