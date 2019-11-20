import { connect } from "react-redux";
import { updateMember } from "../actions/party";

import Timeline from "../components/SignUp";

const mapStateToProps = state => ({
  party: state.party,
  startOfTime: state.encounter.startOfTime,
  encounterDuration: state.encounter.duration,
  snap: state.viewSettings.snap,
  snapTo: state.viewSettings.snapTo
});

const mapDispatchToProps = dispatch => ({
  updateMember: (memberId, member) => dispatch(updateMember(memberId, member))
});

export default connect(mapStateToProps, mapDispatchToProps)(Timeline);
