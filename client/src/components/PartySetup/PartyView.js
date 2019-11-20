import React from "react";
import jobs from "../../data/jobs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faTrash } from "@fortawesome/free-solid-svg-icons";
import Draggable from "react-draggable";
import uuid4 from "uuid/v4";

class PartyView extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  addMember = event => {
    const { x, y, ...member } = event;
    if (!this.isInside(x, y)) return;

    member.cooldowns = member.cooldowns || [];
    member.id = member.id || uuid4();
    member.enabled = member.enabled !== undefined ? member.enabled : true;

    const party = { ...this.props.party, [member.id]: member };
    const view = [...this.props.view, member.id];
    this.props.setParty(party);
    this.props.setView(view);
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
    this.props.dnd.on("drop", this.addMember);
  }

  componentWillUnmount() {
    this.props.dnd.removeListener("drop", this.addMember);
  }

  render() {
    const party = {...this.props.party};
    console.log("party", party)
    console.log(this.props.view)
    const view = [...this.props.view];
    return (
      <div className="party-view" ref={this.myRef}>
        {view.map((id, i) => (
          <Draggable
            key={id}
            onStop={(e, data) => {
              const dIndex = data.y / data.node.clientHeight;
              const sign = dIndex > 0 ? 1 : -1;
              const newView = [...view.slice(0, i), ...view.slice(i + 1)];
              newView.splice(
                i + sign * Math.floor(Math.abs(dIndex)),
                0,
                id
              );

              this.props.setView(newView);
            }}
            position={{ x: 0, y: 0 }}
            handle=".job-icon"
            bounds=".party-view"
          >
            <div className="player-symbols">
              <img
                className="job-icon"
                src={jobs[party[id].job].img}
                alt={jobs[party[id].job].name}
                draggable="false"
              />
              <span
                className="eye"
                onClick={() => {
                  party[id].enabled = !party[id].enabled;
                  this.props.setParty(party);
                }}
              >
                <FontAwesomeIcon icon={party[id].enabled ? faEye : faEyeSlash} />
              </span>
              <span
                className="delete"
                onClick={() => {
                  view.splice(i, 1);
                  this.props.setView(view);
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
