import React from 'react';

class DropdownMenuLabel extends React.Component {
  render() {
    return <div className="dropdown-menu--label">{this.props.children}</div>;
  }
}

export { DropdownMenuLabel };
