import React from 'react';

class MenuHover extends React.Component {
  state = { active: false, mouseInside: false };

  open = () => {
    if (this.props.radio) {
      this.props.radio.active = true;
      this.props.radio.emit('change');
      this.props.radio.once('change', () => {
        this.setState({ active: false });
      });
    }
    this.setState({ active: true });
  };

  close = () => {
    if (this.props.radio) {
      this.props.radio.active = false;
    }
    this.setState({ active: false });
  };

  // handleMouseEnter = event => {
  //   this.setState({ mouseInside: true });
  //   if (!this.state.active) {
  //     setTimeout(() => {
  //       if (this.state.mouseInside) this.open();
  //     }, this.props.showDelay || 0);
  //   }
  // };

  // handleMouseOut = event => {
  //   this.setState({ mouseInside: false });
  // };

  render() {
    const childrenWithProps = React.Children.map(this.props.children, child =>
      React.isValidElement(child)
        ? React.cloneElement(child, {
            close: this.close,
            menuClass: this.props.menuClass
          })
        : child
    );

    console.log(this.props.hover);
    return (
      <div
        className="menu--hover"
        // onMouseEnter={this.handleMouseEnter}
        // onMouseOut={this.handleMouseOut}
      >
        {this.props.label}
        {this.props.arrow ? <span className="menu--arrow">{'\u203A'}</span> : null}
        {this.props.hover ? childrenWithProps : null}
      </div>
    );
  }
}

export { MenuHover };
