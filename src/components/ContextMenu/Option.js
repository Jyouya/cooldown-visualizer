import React from 'react';
import './index.scss';

class Option extends React.Component {
  render() {
    return (
      <div
        className={`contextMenu--option${
          this.props.disabled ? ' contextMenu--option__disabled' : ''
        }`}
        onClick={!this.props.disabled ? this.props.onClick : null}
      >
        {this.props.children || null}
      </div>
    );
  }
}

export { Option };
