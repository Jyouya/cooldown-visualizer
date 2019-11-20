import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class MenuButton extends React.Component {
  state = { active: false };

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

  handleHover = event => {
    if (!this.state.active && this.props.radio && this.props.radio.active) {
      this.open();
    }
  };

  handleClick = event => {
    if (event.target.closest('.menu')) return;
    if (!this.state.active) {
      this.open();
    } else {
      this.close();
    }
  };

  render() {
    const childrenWithProps = React.Children.map(this.props.children, child =>
      React.isValidElement(child)
        ? React.cloneElement(child, { close: this.close })
        : child
    );

    return (
      <div
        className="menu--button"
        onClick={this.handleClick}
        onMouseEnter={this.handleHover}
      >
        {this.props.icon ? (
          <span>
            <FontAwesomeIcon icon={this.props.icon} /> {this.props.label}
          </span>
        ) : (
          this.props.label
        )}
        {this.state.active ? childrenWithProps : null}
      </div>
    );
  }
}

export { MenuButton };
