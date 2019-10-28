import React from 'react';
import './index.scss';

class Label extends React.Component {
  render() {
    return <div className="contextMenu--label">{this.props.children}</div>;
  }
}

export { Label };
