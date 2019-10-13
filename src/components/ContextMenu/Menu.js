import React from 'react';
import './index.scss';

class Menu extends React.Component {
  state = {
    visible: false,
    contents: null
  };

  componentDidMount() {
    document.addEventListener('click', this._handleClick);
    document.addEventListener('scroll', this._handleScroll);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this._handleClick);
    document.removeEventListener('scroll', this._handleScroll);
  }

  show = (event, contents) => {
    event.preventDefault();
    event.persist();

    this.setState({ visible: true, contents }, () => {
      const clickX = event.clientX;
      const clickY = event.clientY;
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const rootW = this.root.offsetWidth;
      const rootH = this.root.offsetHeight;

      const right = screenW - clickX > rootW;
      const left = !right;
      const top = screenH - clickY > rootH;
      const bottom = !top;

      if (right) {
        this.root.style.left = `${clickX + 5}px`;
      }

      if (left) {
        this.root.style.left = `${clickX - rootW - 5}px`;
      }

      if (top) {
        this.root.style.top = `${clickY + 5}px`;
      }

      if (bottom) {
        this.root.style.top = `${clickY - rootH - 5}px`;
      }
    });
  };

  hide = () => this.setState({ visible: false });

  _handleClick = event => {
    const { visible } = this.state;
    // console.log(this.root.contains(event.target));
    // const wasOutside = !(event.target.contains === this.root);
    const wasOutside = !(this.root && this.root.contains(event.target));

    if (wasOutside && visible) this.setState({ visible: false });
  };

  _handleScroll = () => {
    const { visible } = this.state;

    if (visible) this.setState({ visible: false });
  };

  render() {
    const { visible } = this.state;

    return (
      (visible || null) && (
        <div
          ref={ref => {
            this.root = ref;
          }}
          className="contextMenu"
          onContextMenu={e => e.preventDefault()}
        >
          {this.state.contents || null}
        </div>
      )
    );
  }
}

export { Menu };
