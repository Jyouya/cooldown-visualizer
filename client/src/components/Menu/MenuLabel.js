import React from 'react';

class MenuLabel extends React.Component {
  render() {
    return <div className="menu--label">{this.props.children}</div>;
  }
}

export { MenuLabel };
