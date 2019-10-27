import React from 'react';
import { Radio } from './Radio';

class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.radio = new Radio();
  }

  state = { left: false };

  handleDocumentClick = event => {
    if (event.target.closest('.menu, .menu--button')) {
      return;
    }

    this.props.close();
  };

  componentDidMount() {
    document.addEventListener('click', this.handleDocumentClick, true);

    const element = this.myRef.current;

    if (
      element.getClientRects()[0].left + element.clientWidth >
      document.documentElement.clientWidth
    ) {
      this.setState({ left: true });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick);
  }

  render() {
    const childrenWithRadio = React.Children.map(this.props.children, child =>
      React.isValidElement(child)
        ? React.cloneElement(child, {
            radio: this.radio,
            radioDelay: this.props.radioDelay,
            menuClass: this.props.menuClass
          })
        : child
    );

    return (
      <div
        className={
          'menu ' +
          (this.state.left ? 'left ' : 'right ') +
          (this.props.side ? 'side ' : 'bottom ') +
          (this.props.menuClass || '')
        }
        ref={this.myRef}
      >
        {childrenWithRadio}
      </div>
    );
  }
}

export { Menu };
