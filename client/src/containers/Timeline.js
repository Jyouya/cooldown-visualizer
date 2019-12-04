import { connect } from "react-redux";
import { updateMember } from "../actions/party";

import Timeline from "../components/Timeline";

const mapStateToProps = state => ({
  party: state.party,
  startOfTime: state.encounter.startOfTime,
  encounterDuration: state.encounter.duration,
  snap: state.viewSettings.snap,
  snapTo: state.viewSettings.snapTo
});

const mapDispatchToProps = dispatch => ({
  updateMember: (member) => dispatch(updateMember(member))
});

export default connect(mapStateToProps, mapDispatchToProps)(Timeline);
