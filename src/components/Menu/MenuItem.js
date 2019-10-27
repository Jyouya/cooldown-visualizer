import React from 'react';

class MenuItem extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }
  state = { mouseInside: false, active: false };

  deactivate = () => {
    this.setState({ active: false });
  };

  componentWillUnmount() {
    this.props.radio.removeListener('change', this.deactivate);
  }

  handleMouseEnter = event => {
    console.log('mouseenter');
    // this.setState({ mouseInside: true });
    this.mouseInside = true;
    setTimeout(() => {
      const element = this.myRef.current;
      if (!this.state.active && element && element.matches(':hover')) {
        this.props.radio.emit('change');
        this.props.radio.once('change', this.deactivate);
        this.setState({ active: true });
      }
    }, this.props.radioDelay || 0);
  };

  handleMouseOut = event => {
    // this.setState({ mouseInside: false });
    console.log('mouseout');
    this.mouseInside = false;
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
        className={`menu--item${
          this.props.disabled ? ' menu--item__disabled' : ''
        }`}
        onClick={!this.props.disabled ? this.props.onClick : null}
        onMouseEnter={this.handleMouseEnter}
        onMouseOut={this.handleMouseOut}
        ref={this.myRef}
      >
        {childrenWithProps || null}
      </div>
    );
  }
}

export { MenuItem };
