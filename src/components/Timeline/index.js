import React from 'react';
import Cooldown from '../Cooldown';
import { Option, Separator, Label } from '../ContextMenu';
import './index.css';
import { Link } from 'react-router-dom';

import cooldowns from '../../data/cooldowns';
import jobs from '../../data/jobs';

class Timeline extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  state = {
    dragId: 0,
    dragOffset: 0
  };

  componentDidMount() {
    // Determine what cds go on this timeline
    if (Array.isArray(this.props.shared)) this.represents = this.props.shared;
    else this.represents = [this.props.name, this.props.shared].filter(x => x);
  }

  getTime(event) {
    const clientY = event.nativeEvent.clientY;
    const timelineY = clientY - this.myRef.current.getClientRects()[0].top;
    const height = this.myRef.current.clientHeight;
    const duration = this.props.encounterDuration;
    const time = (timelineY / height) * duration;

    return Math.floor(time);
  }

  // TODO: account for instant skills (e.g. assize)
  getActive(time) {
    const activeIds = {}; // Holds the time of active cooldowns
    const activeTimes = {};
    // List cooldowns that are active at the clicked time
    const active = this.represents.filter(cdName => {
      const cd = this.props.cooldowns.find(
        cd =>
          cd.name === cdName &&
          time > cd.time &&
          time - cd.time < cooldowns[cdName].duration
      );
      if (cd) {
        activeIds[cd.name] = cd.id;
        activeTimes[cd.name] = cd.time;
      }
      return cd;
    });

    return { active, activeIds, activeTimes };
  }

  handleMouseDown = event => {
    if (this.state.dragId) return; // Already dragging something
    const time = this.getTime(event);
    const { active, activeIds, activeTimes } = this.getActive(time);

    if (!active.length) return; // Nothing was clicked on

    const mostRecent = Object.entries(activeTimes).reduce(
      (mostRecent, [name, time]) =>
        mostRecent[1] > time ? mostRecent : [name, time],
      ['', -Infinity]
    );

    const dragOffset = mostRecent[1] - time;

    const dragId = activeIds[mostRecent[0]];

    this.setState({ dragId, dragOffset });
  };

  handleMouseUp = event => {
    if (this.state.dragId) this.setState({ dragId: 0 });
  };

  handleMouseMove = event => {
    if (!this.state.dragId) return;

    const { functions, who } = this.props;

    const time = this.getTime(event) + this.state.dragOffset;
    functions.moveCooldown(who, this.state.dragId, time);
  };

  handleContextMenu = event => {
    // Determine the 'time' of the click
    let time = this.getTime(event);

    console.log(time);

    // TODO: consider charges for availability (e.g. lilies)

    // List cooldowns which are unavailable
    const unavailable = this.represents.filter(cdName =>
      this.props.cooldowns.find(
        cd =>
          cd.name === cdName &&
          Math.abs(time - cd.time) < cooldowns[cdName].recast
      )
    );

    const { active, activeIds } = this.getActive(time);

    // List cooldowns available for use
    const available = this.represents.filter(
      cooldown => !active.includes(cooldown)
    );

    this.props.contextMenuRef.current.show(
      event,
      <>
        <Label>
          {Math.floor(time / 6000)
            .toString()
            .padStart(2, '0') +
            ':' +
            ((time % 6000) / 100).toFixed(2).padStart(5, '0')}
        </Label>
        <Separator />
        {available.map((cooldown, i) => (
          <Option
            key={i}
            disabled={unavailable.includes(cooldown)}
            onClick={() => {
              this.props.functions.addCooldown(
                this.props.who,
                cooldown,
                time,
                this.props.contextMenuRef.current.hide
              );
            }}
          >
            <img src={cooldowns[cooldown].img} alt="" />
            <span>{cooldown}</span>
          </Option>
        ))}
        {active.length && available.length ? <Separator /> : null}
        {!active.length
          ? null
          : active.map((cooldown, i) => (
              <Option
                key={i}
                onClick={() => {
                  this.props.functions.removeCooldown(
                    this.props.who,
                    activeIds[cooldown],
                    this.props.contextMenuRef.current.hide
                  );
                }}
              >
                <img src={cooldowns[cooldown].img} alt="" />
                <span>{cooldown}</span>
                <span className="red-x" role="img" aria-label="remove">
                  ❌
                </span>
              </Option>
            ))}
      </>
      // if the click is on a cooldown, show a separator, then a delete button for cds it's on
    );
  };

  // TODO: make unavailable cooldowns inactive in the context menu

  /*
   * * Props:
   * length
   * cooldowns
   */
  render() {
    // TODO: mouseover tooltips

    return (
      <div
        className="timeline"
        ref={this.myRef}
        onContextMenu={this.handleContextMenu}
        // TODO: mouseDown mouseUp mouseMove
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
      >
        <Link to={`/${this.props.who}`}>
          <img
            className="label-icon"
            src={(cooldowns[this.props.name] || jobs[this.props.name]).img}
            alt={this.props.name}
          />
        </Link>
        {this.props.cooldowns.map((cooldown, i) => (
          <Cooldown
            key={i}
            name={cooldown.name}
            time={cooldown.time}
            encounterDuration={this.props.encounterDuration}
            showUnavailable={this.props.showUnavailable}
          />
        ))}
        {/* {represents.map((cooldown, i) => (
          <Option key={i}>
          <img src={cooldowns[cooldown].img} />
          {cooldown}
          </Option>
        ))} */}
      </div>
    );
  }
}

export default Timeline;
