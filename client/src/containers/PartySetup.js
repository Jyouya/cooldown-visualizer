import { connect } from "react-redux";
import { setParty, setViews } from "../actions";
import PartySetup from "../components/PartySetup";

const mapStateToProps = state => ({
  settings: {
    party: state.party,
    views: state.views
  }
});

const mapDispatchToProps = dispatch => ({
  setParty: party => dispatch(setParty(party)),
  setViews: views => dispatch(setViews(views))
});

export default connect(mapStateToProps, mapDispatchToProps)(PartySetup);
