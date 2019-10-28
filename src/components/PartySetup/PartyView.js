import React from 'react';
import jobs from '../../data/jobs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faTrash } from '@fortawesome/free-solid-svg-icons';
import Draggable from 'react-draggable';
import uuid4 from 'uuid/v4';

class PartyView extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  state = { party: [] };

  addMember = event => {
    const { x, y, ...member } = event;
    if (!this.isInside(x, y)) return;
    member.cooldowns = member.cooldowns || [];
    member.id = member.id || uuid4();
    member.enabled = member.enabled !== undefined ? member.enabled : true;

    const party = [...this.props.party, member];
    this.props.setParty(party);
  };

  isInside(x, y) {
    const {
      left,
      right,
      top,
      bottom
    } = this.myRef.current.getBoundingClientRect();
    return left <= x && x <= right && top <= y && y <= bottom;
  }

  componentDidMount() {
    // this.setState({
    //   party: [...this.props.party],
    //   positions: this.props.party.map(x => [{ x: 0, y: 0 }])
    // });
    this.props.dnd.on('drop', this.addMember);
  }

  componentWillUnmount() {
    this.props.dnd.removeListener('drop', this.addMember);
  }

  render() {
    const party = [...this.props.party];
    return (
      <div className="party-view" ref={this.myRef}>
        {party.map((member, i) => (
          <Draggable
            key={member.id}
            onStop={(e, data) => {
              const dIndex = data.y / data.node.clientHeight;
              const sign = dIndex > 0 ? 1 : -1;
              const newParty = [...party.slice(0, i), ...party.slice(i + 1)];
              newParty.splice(
                i + sign * Math.floor(Math.abs(dIndex)),
                0,
                member
              );

              this.props.setParty(newParty);
            }}
            // onDrag={(e, data) => {
            //   const rdIndex = data.y / data.node.clientHeight;
            //   if (Math.abs(rdIndex) >= 1) {
            //     const dIndex =
            //       Math.floor(Math.abs(rdIndex)) * Math.sign(rdIndex);
            //     const newParty = [...party.slice(0, i), ...party.slice(i + 1)];
            //     newParty.splice(i + dIndex, 0, member);
            //     console.log(
            //       (data.y % data.node.clientHeight) * data.node.clientHeight
            //     );
            //     this.setState({
            //       party: newParty,
            //       controlledPosition: {
            //         x: 0,
            //         y:
            //           (data.y % data.node.clientHeight) -
            //           Math.sign(rdIndex) *
            //             Math.floor(data.y / data.node.clientHeight)
            //       }
            //     });
            //   }
            // }}
            position={{ x: 0, y: 0 }}
            // axis="y"
            handle=".job-icon"
            bounds=".party-view"
          >
            <div className="player-symbols">
              <img
                className="job-icon"
                src={jobs[member.job].img}
                alt={jobs[member.job].name}
                draggable="false"
              />
              <span
                className="eye"
                onClick={() => {
                  member.enabled = !member.enabled;
                  this.props.setParty(party);
                }}
              >
                <FontAwesomeIcon icon={member.enabled ? faEye : faEyeSlash} />
              </span>
              <span
                className="delete"
                onClick={() => {
                  party.splice(i, 1);
                  this.props.setParty(party);
                }}
              >
                <FontAwesomeIcon icon={faTrash} />
              </span>
            </div>
          </Draggable>
        ))}
      </div>
    );
  }
}

export default PartyView;
