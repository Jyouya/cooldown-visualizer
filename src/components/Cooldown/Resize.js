import React from 'react';
import './index.scss';

class Resize extends React.Component {
  state = {
    drag: false,
    dragOffset: 0
  };

  componentDidMount() {
    document.addEventListener('mouseup', this.handleMouseUp, true);
    document.addEventListener('mousemove', this.handleMouseMove, true);
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.handleMouseUp, true);
    document.removeEventListener('mousemove', this.handleMouseMove, true);
  }

  handleMouseDown = event => {
    event.stopPropagation();
    this.setState({ drag: true });
  };

  handleMouseUp = event => {
    this.setState({ drag: false });
  };

  handleMouseMove = event => {
    if (!this.state.drag) return;
    event.stopPropagation();
    const {
      who,
      functions,
      cooldown: { time, id }
    } = this.props;
    const duration = functions.getTime({ nativeEvent: event }) - time;
    functions.resizeCooldown(who, id, duration);
  };

  render() {
    return <div className="resize-handle" onMouseDown={this.handleMouseDown} />;
  }
}

export default Resize;
