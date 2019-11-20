import { connect } from 'react-redux';
import { updateMember } from '../actions';
import View from '../components/View';

const mapStateToProps = state => ({
  party: state.party,
  partyViewFilters: state.viewSettings.partyViewFilters,
  playerViewFilters: state.viewSettings.playerViewFilters,
  height:
    ((state.encounter.duration - state.encounter.startOfTime) /
      state.viewSettings.zoom) *
      100 +
    '%'
});

const mapDispatchToProps = dispatch => ({
  updateMember: (memberId, timeline) =>
    dispatch(updateMember(memberId, timeline))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(View);
