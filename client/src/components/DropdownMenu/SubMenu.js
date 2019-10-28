import React from 'react';

class SubMenu extends React.Component {
  state = { active: false };
  render() {
    return (
      <div className={'menu--sub-menu' + (this.state.active ? ' active' : '')}>
        {this.props.children}
      </div>
    );
  }
}

export { SubMenu };
