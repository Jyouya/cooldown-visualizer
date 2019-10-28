import React from 'react';
import './index.scss';

class DropdownMenu extends React.Component {
  state = { active: false };

  componentDidMount() {
    document.addEventListener('click', this.handleDocumentClick, true);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick);
  }

  handleDocumentClick = () => {
    this.setState({ active: false });
  };

  activate = event => {
    event.stopPropagation();
    this.setState({ active: true });
  };

  render() {
    return (
      <label
        className={'dropdown-menu' + (this.state.active ? ' active' : '')}
        onClick={this.activate}
      >
        {this.props.children}
      </label>
    );
  }
}

export { DropdownMenu };
