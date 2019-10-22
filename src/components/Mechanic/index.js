import React from 'react';
import './index.scss';

class Mechanic extends React.Component {
  render() {
    const { encounter, alt } = this.props;
    const name = this.props.name.replace('_', ' ');

    const data = encounter.mechanics[name];
    return (
      <span
        className="mechanic"
        style={data ? data.style : null}
        data-tip={data ? name : null}
        data-for={data ? 'mechanic' : null}
      >
        {alt ? alt.replace('_', ' ') : name}
      </span>
    );
  }
}

export default Mechanic;
