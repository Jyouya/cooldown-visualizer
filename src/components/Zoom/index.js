import React from 'react';
import './index.scss';

class Zoom extends React.Component {
  state = { value: 12000 };

  handleChange = event => {
    this.setState({ value: event.target.value });
    this.props.setZoom(this.state.value);
  };

  render() {
    return (
      <>
        <label className="zoom-label">Zoom</label>
        <input
          className="horizontal-slider zoom-slider"
          type="range"
          min="3000"
          max="30000"
          value={this.state.value}
          onChange={this.handleChange}
        />
        <label className="zoom-readout">{this.state.value / 100}s</label>
      </>
    );
  }
}

export default Zoom;
