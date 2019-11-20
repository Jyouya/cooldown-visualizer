import { connect } from "react-redux";
import { setViewSettings } from "../actions";
import Settings from "../components/Settings";

const mapStateToProps = state => ({
  settings: {
    snap: state.viewSettings.snap,
    partyViewFilters: state.viewSettings.partyViewFilters,
    playerViewFilters: state.viewSettings.playerViewFilters
  }
});

const mapDispatchToProps = dispatch => ({
  setViewSettings: settings => dispatch(setViewSettings(settings))
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
