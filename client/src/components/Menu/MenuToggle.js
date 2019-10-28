import React from 'react';
import { MenuItem } from './MenuItem';

class MenuToggle extends MenuItem {
  handleClick = () => {
    this.props.set(!this.props.on);
  };

  render() {
    const childrenWithProps = React.Children.map(this.props.children, child =>
      React.isValidElement(child)
        ? React.cloneElement(child, {
            hover: this.state.active,
            menuClass: this.props.menuClass
          })
        : child
    );

    return (
      <div
        className={
          'menu--item' +
          (this.props.disabled ? ' menu--item__disabled' : '') +
          (this.props.on ? ' menu--toggle__on' : ' menu--toggle__off')
        }
        onClick={!this.props.disabled ? this.handleClick : null}
        onMouseEnter={this.handleMouseEnter}
        onMouseOut={this.handleMouseOut}
        ref={this.myRef}
      >
        {childrenWithProps || null}
      </div>
    );
  }
}

export { MenuToggle };
