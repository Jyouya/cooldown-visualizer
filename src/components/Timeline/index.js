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
  handleContextMenu = event => {
    // Determine the 'time' of the click
    let time;
    {
      const clientY = event.nativeEvent.clientY;
      const timelineY = clientY - this.myRef.current.getClientRects()[0].top;
      const height = this.myRef.current.clientHeight;
      const duration = this.props.encounterDuration;
      time = (timelineY / height) * duration;
    }

    // Round time to nearest hundredth of a second
    {
      const x = time + 0.00501;
      time = x - (x % 0.01);
    }
    console.log(time);

    // List all cds that this timeline can represent
    let represents;
    if (Array.isArray(this.props.shared)) represents = this.props.shared;
    else represents = [this.props.name, this.props.shared].filter(x => x);

    // TODO: consider charges for availability (e.g. lilies)

    // TODO: account for instant skills (e.g. assize)

    // List cooldowns which are unavailable
    const unavailable = represents.filter(cdName =>
      this.props.cooldowns.find(
        cd =>
          cd.name === cdName &&
          Math.abs(time - cd.time) < cooldowns[cdName].recast
      )
    );

    const activeIds = {}; // Holds the time of active cooldowns

    // List cooldowns that are active at the clicked time
    const active = represents.filter(cdName => {
      const cd = this.props.cooldowns.find(
        cd =>
          cd.name === cdName &&
          time > cd.time &&
          time - cd.time < cooldowns[cdName].duration
      );
      if (cd) activeIds[cd.name] = cd.id;
      return cd;
    });

    // List cooldowns available for use
    const available = represents.filter(cooldown => !active.includes(cooldown));

    this.props.contextMenuRef.current.show(
      event,
      <>
        <Label>
          {Math.floor(time / 60)
            .toString()
            .padStart(2, '0') +
            ':' +
            (time % 60).toFixed(2).padStart(5, '0')}
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
