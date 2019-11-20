import React from "react";
import Cooldown from "../Cooldown";
import { Option, Separator, Label } from "../ContextMenu";
import "./index.scss";
import { Link } from "react-router-dom";

import cooldowns from "../../data/cooldowns";
import jobs from "../../data/jobs";
import resources from "../../data/resources";

import getResource from "../../utils/getResource";
import dummyCooldown from "../../utils/dummyCooldown";
import getCharges from "../../utils/getCharges";
import timestamp from "../../utils/timestamp";

import {
  checkRecastCollision,
  checkResourceAvailability,
  checkBusy,
  checkRequirements,
  checkCharges
} from "../../utils/cooldownTests";
import closestResource from "../../utils/closestResource";
import closestCharge from "../../utils/closestCharge";
import sortedInsert from "../../utils/sortedInsert";

import uuid4 from "uuid/v4";

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

    document.addEventListener("mouseup", this.handleMouseUp, true);
    document.addEventListener("mousemove", this.handleMouseMove, true);
  }

  componentDidUpdate() {
    // Determine what cds go on this timeline
    if (Array.isArray(this.props.shared)) this.represents = this.props.shared;
    else this.represents = [this.props.name, this.props.shared].filter(x => x);

    document.removeEventListener("mouseup", this.hanldeMouseUp);
    document.removeEventListener("mousemove", this.handleMouseMove);
  }

  snap(time) {
    if (!this.props.snap) return time;
    const t = time + this.props.snapTo / 2;
    return t - (t % this.props.snapTo);
  }

  addCooldown = (name, time, after) => {
    const party = [...this.props.party];
    const cd = cooldowns[name];
    const timeline = party[this.props.who].cooldowns;

    const duration = cd.variable ? cd.minMax(time, timeline)[0] : cd.duration;

    party[this.props.who].cooldowns = sortedInsert(
      timeline,
      { name, time, id: uuid4(), duration },
      (a, b) => (a.time > b.time ? 1 : -1)
    );

    this.props.updateMember(this.props.who, party[this.props.who]);
    after && after();
  };

  moveCooldown = (id, time, after) => {
    const { startOfTime, encounterDuration } = this.props;
    if (time < startOfTime) time = startOfTime;
    if (time > encounterDuration - 100) time = encounterDuration - 100;
    time = this.snap(time);

    const party = [...this.props.party];
    let timeline = party[this.props.who].cooldowns;
    const targetIndex = timeline.findIndex(cd => cd.id === id);
    const target = timeline[targetIndex];

    const timeStack = [target.time];

    // Remove target from the party, so we're not comparing it to itself
    timeline[targetIndex] = {};

    const requires = checkRequirements(timeline, target, time);

    if (!requires) {
      // find nearest time when the required skill is active
      const requirement = cooldowns[target.name].requires;
      const windows = timeline.filter(({ name }) => name === requirement);

      const windowIndex = windows
        .map(({ time, duration }, i) =>
          Math.abs(target.time - time - duration / 2)
        )
        .reduce((iMin, x, i, arr) => (x < arr[iMin] ? i : iMin), 0);

      const window = windows[windowIndex];
      const left = window.time;
      const right = window.time + window.duration;

      if (Math.abs(left - time) > Math.abs(right - time)) time = right;
      else time = left;

      timeStack.push(time);
    }

    // Determine if the cooldown is available
    const unavailable = checkRecastCollision(timeline, target, time);

    const recast = cooldowns[target.name].recast;

    if (unavailable) {
      if (
        (time > unavailable.time &&
          unavailable.time + recast < encounterDuration) ||
        unavailable.time - recast < startOfTime
      )
        time = unavailable.time + recast;
      else time = unavailable.time - recast;
      timeStack.push(time);
    }

    if (!checkCharges(timeline, target, time)) {
      time = closestCharge(target, timeline);
      timeStack.push(time);
    }

    // check if we (or the pet) is channeling a skill
    const busy = checkBusy(timeline, target, time);

    if (busy) {
      if (
        time > busy.time + busy.duration / 2 &&
        busy.time + busy.duration < encounterDuration
      )
        time = busy.time + busy.duration;
      else time = busy.time - 1;
      timeStack.push(time);
    }

    if (checkResourceAvailability(timeline, target, time)) {
      time = closestResource(
        target,
        cooldowns[target.name].resource.cost.name,
        timeline,
        target.time
      );
      timeStack.push(time);
    }

    // Validate the new position, if not, find one that is valid
    timeStack.pop();
    while (timeStack.length > 0) {
      if (
        !(
          checkRecastCollision(timeline, target, time) ||
          checkResourceAvailability(timeline, target, time) ||
          checkBusy(timeline, target, time) ||
          checkRequirements(timeline, target, time) ||
          checkCharges(timeline, target, time)
        )
      ) {
        break;
      }
      time = timeStack.pop();
    }

    if (
      (targetIndex && timeline[targetIndex - 1].time > time) ||
      (targetIndex < timeline.length - 1 &&
        timeline[targetIndex + 1].time < time)
    ) {
      // Determine if the timeline needs to be resorted
      // Resort timeline
      // Remove targetIndex
      timeline.splice(targetIndex, 1);
      timeline = sortedInsert(timeline, { ...target, time }, (a, b) =>
        a.time > b.time ? 1 : -1
      );
    } else {
      // Reinsert target
      timeline[targetIndex] = { ...target, time };
    }

    party[this.props.who].cooldowns = timeline;

    this.props.updateMember(this.props.who, party[this.props.who]);

    after && after();
  };

  // TODO: cds that are depended on by others (e.g. Aetherflow) need to cascade their deletion
  removeCooldown = (id, after) => {
    const { who } = this.props;
    const party = [...this.props.party];

    const i = party[who].cooldowns.findIndex(cd => cd.id === id);

    party[who].cooldowns.splice(i, 1);

    this.props.updateMember(who, party[who]);

    after && after();
  };

  resizeCooldown = (id, duration, after) => {
    const { who } = this.props;
    const party = [...this.state.party];
    const timeline = party[this.props.who].cooldowns;
    const targetIndex = timeline.findIndex(cd => cd.id === id);
    const cooldown = timeline[targetIndex];
    timeline[targetIndex] = {};
    const [min, max] = cooldowns[cooldown.name].minMax(cooldown.time, timeline);

    cooldown.duration = Math.min(Math.max(min, duration), max);
    timeline[targetIndex] = cooldown;

    this.props.updateMember(who);

    after && after();
  };

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
            time - cd.time < cd.duration) ||
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

  getUnavailable(name, time) {
    const resource = cooldowns[name].resource;
    const requires = cooldowns[name].requires;
    const charges = cooldowns[name].charges;

    const rawTimeline = this.props.party[this.props.who].cooldowns;
    return (
      rawTimeline.find(
        cd =>
          // Test if it's on cooldown
          (cd.name === name &&
            Math.abs(time - cd.time) < cooldowns[name].recast) ||
          // Test if we (or the pet) are busy
          (cooldowns[name][cooldowns[cd.name].channel] &&
            time > cd.time &&
            time < cd.time + cd.duration)
      ) ||
      // Test if we have the resources to use it
      (resource &&
        resource.cost &&
        getResource(
          dummyCooldown(rawTimeline, name, time),
          resource.cost.name,
          rawTimeline
        ) <
          resource.cost.amount(
            dummyCooldown(rawTimeline, name, time),
            rawTimeline
          )) ||
      (requires &&
        !rawTimeline.find(
          cd =>
            cd.name === requires &&
            cd.time < time &&
            time < cd.time + cd.duration
        )) ||
      (charges &&
        Array.from(Array(charges.max))
          .map((_, i) =>
            this.props.cooldowns.filter(
              cd =>
                cd.name === name &&
                cd.time < time + (charges.max - i) * charges.time &&
                cd.time > time - i * charges.time
            )
          )
          .find(arr => arr.length === charges.max))
    );
  }

  handleMouseDown = event => {
    if (this.state.dragId) return; // Already dragging something

    const time = this.getTime(event);
    const { active, activeIds, activeTimes } = this.getActive(time);

    if (!active.length) return; // Nothing was clicked on

    const mostRecent = Object.entries(activeTimes).reduce(
      (mostRecent, [name, time]) =>
        mostRecent[1] > time ? mostRecent : [name, time],
      ["", -Infinity]
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

    const { who } = this.props;

    const time = this.getTime(event) + this.state.dragOffset;
    this.moveCooldown(this.state.dragId, time);
  };

  handleContextMenu = event => {
    const rawTimeline = this.props.party[this.props.who].cooldowns;

    // Determine the 'time' of the click
    let time = this.getTime(event);

    const { active, activeIds } = this.getActive(time);

    // List cooldowns which are unavailable
    const unavailable = this.represents.filter(name =>
      this.getUnavailable(name, time)
    );

    // List cooldowns available for use
    const available = this.represents.filter(
      cooldown => !active.includes(cooldown)
    );

    this.props.contextMenuRef.current.show(
      event,
      <>
        <Label>
          <span className="symbol" role="img" aria-label="Time">
            ⏱️{" "}
          </span>
          {timestamp(time)}
        </Label>
        <Separator />
        {available.map((cooldown, i) => {
          const baseData = cooldowns[cooldown];
          const data =
            (baseData.upgrade && {
              ...baseData,
              ...baseData.upgrade(
                dummyCooldown(this.props.cooldowns, cooldown, time),
                rawTimeline
              )
            }) ||
            baseData;
          return (
            <Option
              key={i}
              disabled={unavailable.includes(cooldown)}
              onClick={() => {
                this.addCooldown(
                  this.props.who,
                  cooldown,
                  time,
                  this.props.contextMenuRef.current.hide
                );
              }}
            >
              <img src={data.img} alt="" />
              <span>{data.name || cooldown}</span>
              {(cooldowns[cooldown].resource &&
                (cooldowns[cooldown].resource.cost ? (
                  <span className="resource-info">
                    <span
                      className="symbol"
                      role="img"
                      aria-label={cooldowns[cooldown].resource.cost.name}
                    >
                      {resources[cooldowns[cooldown].resource.cost.name].symbol}
                      :{" "}
                    </span>
                    {Math.max(
                      Math.floor(
                        getResource(
                          dummyCooldown(rawTimeline, cooldown, time),
                          cooldowns[cooldown].resource.cost.name,
                          rawTimeline
                        )
                      ),
                      0
                    )}
                  </span>
                ) : null)) ||
                (cooldowns[cooldown].charges ? (
                  <span className="resource-info">
                    <span className="symbol" role="img" aria-label="charges">
                      ⚡:{" "}
                    </span>
                    {getCharges(this.props.cooldowns, cooldown, time)}
                  </span>
                ) : null)}
            </Option>
          );
        })}
        {active.length && available.length ? <Separator /> : null}
        {!active.length
          ? null
          : active.map((cooldown, i) => (
              <Option
                key={i}
                onClick={() => {
                  this.removeCooldown(
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
        // onMouseMove={this.handleMouseMove}
      >
        <Link to={`/${this.props.who}`} draggable="false">
          <img
            className="label-icon"
            src={(cooldowns[this.props.name] || jobs[this.props.name]).img}
            alt={this.props.name}
            draggable="false"
          />
        </Link>
        <div className="timeline-wrapper">
          {this.props.cooldowns.map((cooldown, i) => (
            <Cooldown
              key={i}
              cooldown={cooldown}
              who={this.props.who}
              resizeCooldown={this.resizeCooldown}
              getTime={this.getTime}
              encounterDuration={this.props.encounterDuration}
              startOfTime={this.props.startOfTime}
              showUnavailable={this.props.showUnavailable}
              grabbing={this.state.dragId === cooldown.id}
              raw={this.props.party[this.props.who].cooldowns}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default Timeline;
