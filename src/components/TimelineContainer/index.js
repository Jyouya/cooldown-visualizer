import React from 'react';
// import ReactToolTip from 'react-tooltip';
import Timeline from '../Timeline';
import { Context } from '../ContextMenu';
import './index.css';

class TimelineContainer extends React.Component {
  render() {
    // TODO: overlay encounter information on top of the timelines
    return (
      <Context.Consumer>
        {value => {
          return (
            <div
              className="timeline-container"
              style={{
                height:
                  (this.props.encounterDuration / this.props.zoom) * 100 + '%'
              }}
            >
              {this.props.timelines.map((timeline, i) => (
                <Timeline
                  key={i}
                  name={timeline.name}
                  who={timeline.who}
                  cooldowns={timeline.cooldowns}
                  encounterDuration={this.props.encounterDuration}
                  showUnavailable={this.props.showUnavailable}
                  shared={timeline.shared}
                  contextMenuRef={value}
                  zoom={this.props.zoom}
                  functions={this.props.functions}
                />
              ))}
            </div>
          );
        }}
      </Context.Consumer>
    );
  }
}

export default TimelineContainer;
