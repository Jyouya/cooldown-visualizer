import React from 'react';
import Cooldown from '../Cooldown';
import { Option, Separator, Label } from '../ContextMenu';
import './index.scss';
import { Link } from 'react-router-dom';

import cooldowns from '../../data/cooldowns';
import jobs from '../../data/jobs';
import resources from '../../data/resources';

import getResource from '../../utils/getResource';
import dummyCooldown from '../../utils/dummyCooldown';

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

    document.addEventListener('mouseup', this.handleMouseUp);
  }

  componentDidUpdate() {
    // Determine what cds go on this timeline
    if (Array.isArray(this.props.shared)) this.represents = this.props.shared;
    else this.represents = [this.props.name, this.props.shared].filter(x => x);

    document.removeEventListener('mouseup', this.hanldeMouseUp);
  }

  pixToTime = px => {
    const height = this.myRef.current.clientHeight;
    const duration = this.props.encounterDuration;
    const time = (px / height) * duration;

    return Math.floor(time);
  };

  getTime = event => {
    const clientY = event.nativeEvent.clientY;
    const timelineY = clientY - this.myRef.current.getClientRects()[0].top;
    return this.pixToTime(timelineY);
  };

  getActive(time) {
    const activeIds = {}; // Holds the time of active cooldowns
    const activeTimes = {};
    const width = this.pixToTime(this.myRef.current.clientWidth);
    // List cooldowns that are active at the clicked time
    const active = this.represents.filter(cdName => {
      const cd = this.props.cooldowns.find(
        cd =>
          (cd.name === cdName &&
            time > cd.time &&
            time - cd.time < cooldowns[cdName].duration) ||
          (cd.name === cdName && time >= cd.time && time < cd.time + width)
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

    // TODO: consider charges for availability (e.g. consolation)

    // List cooldowns which are unavailable
    const unavailable = this.represents.filter(cdName => {
      const resource = cooldowns[cdName].resource;
      return (
        this.props.cooldowns.find(
          cd =>
            cd.name === cdName &&
            Math.abs(time - cd.time) < cooldowns[cdName].recast
        ) ||
        (resource &&
          resource.cost &&
          getResource(
            dummyCooldown(this.props.raw, cdName, time),
            resource.cost.name,
            this.props.raw
          ) <
            resource.cost.amount(
              dummyCooldown(this.props.raw, cdName, time),
              this.props.raw
            )) ||
        this.props.raw.find(
          cd =>
            cd.name &&
            (cooldowns[cdName][cooldowns[cd.name].channel] &&
              time > cd.time &&
              time < cd.time + cd.duration)
        )
      );
    });

    const { active, activeIds } = this.getActive(time);

    // List cooldowns available for use
    const available = this.represents.filter(
      cooldown => !active.includes(cooldown)
    );

    this.props.contextMenuRef.current.show(
      event,
      <>
        <Label>
          <span className="symbol" role="img" aria-label="Time">
            ⏱️{' '}
          </span>
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
            {cooldowns[cooldown].resource &&
            cooldowns[cooldown].resource.cost ? (
              <span className="resource-info">
                <span
                  className="symbol"
                  role="img"
                  aria-label={cooldowns[cooldown].resource.cost.name}
                >
                  {resources[cooldowns[cooldown].resource.cost.name].symbol}:{' '}
                </span>
                {Math.floor(
                  getResource(
                    dummyCooldown(this.props.raw, cooldown, time),
                    cooldowns[cooldown].resource.cost.name,
                    this.props.raw
                  )
                )}
              </span>
            ) : null}
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

  /*
   * * Props:
   * length
   * cooldowns
   */
  render() {
    return (
      <div
        className="timeline"
        ref={this.myRef}
        onContextMenu={this.handleContextMenu}
        onMouseDown={this.handleMouseDown}
        // onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
      >
        <Link to={`/${this.props.who}`}>
          <img
            className="label-icon"
            src={(cooldowns[this.props.name] || jobs[this.props.name]).img}
            alt={this.props.name}
          />
        </Link>
        <div className="timeline-wrapper">
          {this.props.cooldowns.map((cooldown, i) => (
            <Cooldown
              key={i}
              cooldown={cooldown}
              who={this.props.who}
              functions={{ ...this.props.functions, getTime: this.getTime }}
              encounterDuration={this.props.encounterDuration}
              showUnavailable={this.props.showUnavailable}
              grabbing={this.state.dragId === cooldown.id}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default Timeline;
