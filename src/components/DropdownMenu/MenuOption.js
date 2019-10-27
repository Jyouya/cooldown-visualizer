import React from 'react';

class MenuOption extends React.Component {
  render() {
    return (
      <div
        className={`menu--option${
          this.props.disabled ? ' menu--option__disabled' : ''
        }`}
        // && || instead of ternary, to default to null if no onClick provided
        onClick={(!this.props.disabled && this.props.onClick) || null}
      >
        {this.props.children || null}
      </div>
    );
  }
}

export { MenuOption };
