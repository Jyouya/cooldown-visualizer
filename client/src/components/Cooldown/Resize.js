import React from "react";
import cooldowns from "../../data/cooldowns";
import "./index.scss";

class Resize extends React.Component {
  state = {
    drag: false,
    dragOffset: 0
  };

  componentDidMount() {
    document.addEventListener("mouseup", this.handleMouseUp, true);
    document.addEventListener("mousemove", this.handleMouseMove, true);
  }

  componentWillUnmount() {
    document.removeEventListener("mouseup", this.handleMouseUp, true);
    document.removeEventListener("mousemove", this.handleMouseMove, true);
  }

  handleMouseDown = event => {
    event.stopPropagation();
    const {
      getTime,
      cooldown: { time, duration }
    } = this.props;
    const dragOffset = getTime({ nativeEvent: event }) - (time + duration);

    this.setState({ drag: true, dragOffset });
  };

  handleMouseUp = event => {
    this.setState({ drag: false });
  };

  handleMouseMove = event => {
    if (!this.state.drag) return;
    event.stopPropagation();
    const {
      who,
      getTime,
      resizeCooldown,
      cooldown: { time, id }
    } = this.props;
    const duration =
      getTime({ nativeEvent: event }) - time - this.state.dragOffset;
    resizeCooldown(who, id, duration);
  };

  render() {
    const detonate = cooldowns[this.props.cooldown.name].detonate;
    return (
      <div onMouseDown={this.handleMouseDown}>
        <div className={"resize-handle"} />
        {detonate ? (
          <img className="icon" src={detonate} alt="" draggable="false" />
        ) : null}
      </div>
    );
  }
}

export default Resize;
