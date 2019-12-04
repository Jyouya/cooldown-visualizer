import { connect } from 'react-redux';
import { setViews, setParty, setMechanics, setViewSettings } from '../actions';

import Encounter from '../components/Encounter';

const mapStateToProps = state => ({
  party: state.party,
  views: state.views,
  viewSettings: state.viewSettings,
  encounter: state.encounter
});

const mapDispatchToProps = dispatch => ({
  setViews: views => dispatch(setViews(views)),
  setParty: party => dispatch(setParty(party)),
  setMechanics: mechanics => dispatch(setMechanics(mechanics)),
  setViewSettings: settings => dispatch(setViewSettings(settings))
});

export default connect(mapStateToProps, mapDispatchToProps)(Encounter);
