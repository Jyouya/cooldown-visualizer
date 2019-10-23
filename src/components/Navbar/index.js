import React from 'react';
import './index.scss';

class Navbar extends React.Component {
  render() {
    return <div className="navbar">{this.props.children}</div>;
  }
}

export default Navbar;
