import React from 'react';
import './index.scss';

class Modal extends React.Component {
  render() {
    const { isShown, ...props } = this.props;

    return isShown ? (
      <div className="modal" onClick={this.props.close}>
        <div className="content" onClick={e => e.stopPropagation()}>
          {React.Children.map(this.props.children, child =>
            React.isValidElement(child) && typeof child.type !== 'string'
              ? React.cloneElement(child, props)
              : child
          )}
        </div>
      </div>
    ) : null;
  }
}

export default Modal;
